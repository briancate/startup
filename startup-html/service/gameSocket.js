const { WebSocketServer, WebSocket } = require('ws');
const { PLAYERS, createGame, applyPlayCard, applyAiCard, clearTrick, legalCards } = require('./gameEngine');

// Only South is human-controlled for now; every connected client is treated as that seat.
// Real per-player seating comes with proper multiplayer sessions.
const HUMAN_PLAYER = 'South';
const TRICK_DISPLAY_MS = 1200;
const AI_MOVE_MS = 700;

// Strips the other players' hands down to a card count so a client never sees hidden cards.
function sanitizeForClient(state) {
  const { hands, ...publicState } = state;
  const handCounts = {};
  PLAYERS.forEach((player) => {
    handCounts[player] = hands[player].length;
  });

  const canPlay = !state.gameOver && !state.trickWinner && state.currentPlayer === HUMAN_PLAYER;
  const legalPlays = canPlay ? legalCards(hands[HUMAN_PLAYER], state.trick.leadSuit, state.trumpSuit.name) : [];

  return { ...publicState, hand: hands[HUMAN_PLAYER], handCounts, legalCards: legalPlays };
}

function gameSocket(httpServer) {
  const socketServer = new WebSocketServer({ server: httpServer });
  let state = createGame();
  let pendingTimer = null;

  function broadcast() {
    const message = JSON.stringify({ type: 'state', state: sanitizeForClient(state) });
    socketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(message);
    });
  }

  function sendTo(socket) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'state', state: sanitizeForClient(state) }));
    }
  }

  // Advances the game on its own: clears a shown trick, or plays the next AI card.
  function scheduleNext() {
    clearTimeout(pendingTimer);
    if (state.gameOver) return;

    if (state.trickWinner) {
      pendingTimer = setTimeout(() => {
        state = clearTrick(state);
        broadcast();
        scheduleNext();
      }, TRICK_DISPLAY_MS);
      return;
    }

    if (state.currentPlayer !== HUMAN_PLAYER && state.hands[state.currentPlayer].length > 0) {
      pendingTimer = setTimeout(() => {
        state = applyAiCard(state);
        broadcast();
        scheduleNext();
      }, AI_MOVE_MS);
    }
  }

  socketServer.on('connection', (socket) => {
    socket.isAlive = true;
    sendTo(socket);

    socket.on('message', (data) => {
      let message;
      try {
        message = JSON.parse(data);
      } catch {
        return;
      }

      if (message.type === 'playCard' && message.card) {
        state = applyPlayCard(state, HUMAN_PLAYER, message.card);
        broadcast();
        scheduleNext();
      } else if (message.type === 'newGame') {
        clearTimeout(pendingTimer);
        state = createGame();
        broadcast();
        scheduleNext();
      }
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

  scheduleNext();
}

module.exports = { gameSocket };
