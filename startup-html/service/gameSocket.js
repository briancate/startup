const { WebSocketServer, WebSocket } = require('ws');
const { PLAYERS, createGame, applyPlayCard, applyAiCard, clearTrick, legalCards } = require('./gameEngine');

const TRICK_DISPLAY_MS = 1200;
const AI_MOVE_MS = 700;

// Builds the per-client view of the game. A client with a seat is a player and only ever
// sees its own hand; everyone else (and any seat with no connected socket) is AI/observer-visible only.
function sanitizeForClient(state, seats, observerCount, socket) {
  const payload = {
    type: 'state',
    role: socket.seat ? 'player' : 'observer',
    seat: socket.seat || null,
    seats: PLAYERS.reduce((acc, player) => {
      acc[player] = { connected: !!seats[player] };
      return acc;
    }, {}),
    observerCount,
    started: state !== null,
  };
  if (!state) return payload;

  const { hands, ...publicState } = state;
  const handCounts = {};
  PLAYERS.forEach((player) => {
    handCounts[player] = hands[player].length;
  });

  const mySeat = socket.seat;
  const hand = mySeat ? hands[mySeat] : [];
  const canPlay = !!mySeat && !state.gameOver && !state.trickWinner && state.currentPlayer === mySeat;
  const legalPlays = canPlay ? legalCards(hand, state.trick.leadSuit, state.trumpSuit.name) : [];

  return { ...payload, ...publicState, hand, handCounts, legalCards: legalPlays };
}

function gameSocket(httpServer) {
  const socketServer = new WebSocketServer({ server: httpServer });
  // Tracks which socket, if any, is seated at each of the four named seats.
  // A seat with no connected socket is played by the AI.
  const seats = { South: null, West: null, North: null, East: null };
  let state = null;
  let pendingTimer = null;

  function broadcast() {
    const observerCount = [...socketServer.clients].filter((client) => !client.seat).length;
    socketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(sanitizeForClient(state, seats, observerCount, client)));
      }
    });
  }

  // Advances the game on its own: clears a shown trick, or plays the next AI/vacant-seat card.
  function scheduleNext() {
    clearTimeout(pendingTimer);
    if (!state || state.gameOver) return;

    if (state.trickWinner) {
      pendingTimer = setTimeout(() => {
        state = clearTrick(state);
        broadcast();
        scheduleNext();
      }, TRICK_DISPLAY_MS);
      return;
    }

    const seatIsAi = !seats[state.currentPlayer];
    if (seatIsAi && state.hands[state.currentPlayer].length > 0) {
      pendingTimer = setTimeout(() => {
        state = applyAiCard(state);
        broadcast();
        scheduleNext();
      }, AI_MOVE_MS);
    }
  }

  function startGame() {
    if (state && !state.gameOver) return;
    clearTimeout(pendingTimer);
    state = createGame();
    broadcast();
    scheduleNext();
  }

  socketServer.on('connection', (socket) => {
    socket.isAlive = true;
    // The first four connected clients take the open seats and become players;
    // everyone after that is an observer.
    socket.seat = PLAYERS.find((player) => !seats[player]) || null;
    if (socket.seat) seats[socket.seat] = socket;
    broadcast();

    socket.on('message', (data) => {
      let message;
      try {
        message = JSON.parse(data);
      } catch {
        return;
      }

      if (message.type === 'playCard' && message.card && socket.seat && state) {
        state = applyPlayCard(state, socket.seat, message.card);
        broadcast();
        scheduleNext();
      } else if (message.type === 'startGame') {
        startGame();
      }
    });

    socket.on('close', () => {
      if (socket.seat && seats[socket.seat] === socket) {
        // The seat is now vacant, so the AI takes over playing it.
        seats[socket.seat] = null;
      }
      broadcast();
      scheduleNext();
    });

    socket.on('pong', () => {
      socket.isAlive = true;
    });
  });

  // Periodically send out a ping message to make sure clients are alive
  setInterval(() => {
    socketServer.clients.forEach((client) => {
      if (client.isAlive === false) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 10000);
}

module.exports = { gameSocket };
