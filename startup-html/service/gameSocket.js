const { WebSocketServer, WebSocket } = require('ws');
const { PLAYERS, createGame, applyPlayCard, applyAiCard, clearTrick, legalCards } = require('./gameEngine');
const DB = require('./database');

const TRICK_DISPLAY_MS = 1200;
const AI_MOVE_MS = 700;
const AUTH_COOKIE_NAME = 'token';

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((pair) => {
    const i = pair.indexOf('=');
    if (i === -1) return;
    cookies[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim());
  });
  return cookies;
}

// Looks up the logged-in username for a websocket upgrade request, if any.
async function getUsernameFromRequest(request) {
  const token = parseCookies(request.headers.cookie)[AUTH_COOKIE_NAME];
  if (!token) return null;
  const user = await DB.getUserByToken(token);
  return user ? user.username : null;
}

// Builds the per-client view of the game. A client with a seat is a player and only ever
// sees its own hand; everyone else (and any seat with no connected socket) is AI/observer-visible only.
function sanitizeForClient(state, seats, observerCount, socket) {
  const payload = {
    type: 'state',
    role: socket.seat ? 'player' : 'observer',
    seat: socket.seat || null,
    seats: PLAYERS.reduce((acc, player) => {
      acc[player] = { connected: !!seats[player], name: (seats[player] && seats[player].username) || null };
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
  let connectedCount = 0;

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

  socketServer.on('connection', (socket, request) => {
    socket.isAlive = true;
    socket.username = null;
    connectedCount += 1;
    // The first four connected clients take the open seats and become players;
    // everyone after that is an observer.
    socket.seat = PLAYERS.find((player) => !seats[player]) || null;
    if (socket.seat) seats[socket.seat] = socket;
    broadcast();

    getUsernameFromRequest(request).then((username) => {
      socket.username = username;
      broadcast();
    });

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
      connectedCount -= 1;
      if (socket.seat && seats[socket.seat] === socket) {
        // The seat is now vacant, so the AI takes over playing it.
        seats[socket.seat] = null;
      }
      if (connectedCount <= 0) {
        // Nobody is left watching; drop the finished/in-progress game so the
        // next visitor sees a fresh seat-assignment screen, not stale results.
        connectedCount = 0;
        clearTimeout(pendingTimer);
        state = null;
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
