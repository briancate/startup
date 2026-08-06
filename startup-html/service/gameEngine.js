const PLAYERS = ['South', 'West', 'North', 'East'];
const ROTATION = ['West', 'North', 'East', 'South'];

const SUITS = [
  { name: 'clubs', symbol: '♣' },
  { name: 'diamonds', symbol: '♦' },
  { name: 'spades', symbol: '♠' },
  { name: 'hearts', symbol: '♥' },
];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUIT_ORDER = SUITS.map((suit) => suit.name);

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit: suit.name, suitSymbol: suit.symbol });
    }
  }
  return deck;
}

// Fisher-Yates shuffle. Returns a new shuffled array; does not mutate the input.
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Splits a deck evenly across players, dealing one card at a time in round-robin order.
function dealCards(deck, numPlayers) {
  const hands = Array.from({ length: numPlayers }, () => []);
  deck.forEach((card, i) => {
    hands[i % numPlayers].push(card);
  });
  return hands;
}

function sortHand(hand) {
  return [...hand].sort((a, b) => {
    const suitDiff = SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
  });
}

function randomCard(hand) {
  return hand[Math.floor(Math.random() * hand.length)];
}

function nextPlayer(player) {
  return ROTATION[(ROTATION.indexOf(player) + 1) % ROTATION.length];
}

function teamOf(player) {
  return player === 'West' || player === 'East' ? 1 : 2;
}

// Cards a player is allowed to play: follow the lead suit if they can,
// otherwise trump if they have it, otherwise anything.
function legalCards(hand, leadSuit, trumpSuitName) {
  if (!leadSuit) return hand;
  const followSuit = hand.filter((c) => c.suit === leadSuit);
  if (followSuit.length > 0) return followSuit;
  const trumpCards = hand.filter((c) => c.suit === trumpSuitName);
  if (trumpCards.length > 0) return trumpCards;
  return hand;
}

function chooseAiCard(hand, leadSuit, trumpSuitName) {
  return randomCard(legalCards(hand, leadSuit, trumpSuitName));
}

// Highest trump played wins the trick; if no trump was played, highest card of the lead suit wins.
function getTrickWinner(trickCards, leadSuit, trumpSuitName) {
  const entries = Object.entries(trickCards);
  const trumpEntries = entries.filter(([, card]) => card.suit === trumpSuitName);
  const contest = trumpEntries.length > 0 ? trumpEntries : entries.filter(([, card]) => card.suit === leadSuit);
  return contest.reduce((best, entry) => (RANKS.indexOf(entry[1].rank) > RANKS.indexOf(best[1].rank) ? entry : best))[0];
}

function createGame() {
  const deck = shuffleDeck(createDeck());
  const dealt = dealCards(deck, PLAYERS.length);
  const hands = {};
  PLAYERS.forEach((player, i) => {
    hands[player] = dealt[i];
  });
  hands.South = sortHand(hands.South);

  return {
    hands,
    trumpSuit: SUITS[Math.floor(Math.random() * SUITS.length)],
    trick: { cards: {}, leadSuit: null },
    currentPlayer: ROTATION[Math.floor(Math.random() * ROTATION.length)],
    trickWinner: null,
    team1Score: 0,
    team2Score: 0,
    gameOver: false,
  };
}

// Applies a card play for `player`. Returns the state unchanged if the move is illegal,
// so the caller can safely broadcast the result either way.
function applyPlayCard(state, player, card) {
  if (state.gameOver || state.trickWinner || state.currentPlayer !== player) return state;

  const hand = state.hands[player];
  const cardInHand = hand.find((c) => c.suit === card.suit && c.rank === card.rank);
  if (!cardInHand) return state;

  const legal = legalCards(hand, state.trick.leadSuit, state.trumpSuit.name);
  if (!legal.includes(cardInHand)) return state;

  const hands = { ...state.hands, [player]: hand.filter((c) => c !== cardInHand) };
  const isLead = Object.keys(state.trick.cards).length === 0;
  const leadSuit = isLead ? cardInHand.suit : state.trick.leadSuit;
  const cards = { ...state.trick.cards, [player]: cardInHand };

  if (Object.keys(cards).length < ROTATION.length) {
    return { ...state, hands, trick: { cards, leadSuit }, currentPlayer: nextPlayer(player) };
  }

  const winner = getTrickWinner(cards, leadSuit, state.trumpSuit.name);
  const team = teamOf(winner);
  return {
    ...state,
    hands,
    trick: { cards, leadSuit },
    trickWinner: winner,
    team1Score: state.team1Score + (team === 1 ? 1 : 0),
    team2Score: state.team2Score + (team === 2 ? 1 : 0),
  };
}

// Picks and plays a card for the current player using simple AI. Assumes it's their turn.
function applyAiCard(state) {
  const hand = state.hands[state.currentPlayer];
  const card = chooseAiCard(hand, state.trick.leadSuit, state.trumpSuit.name);
  return applyPlayCard(state, state.currentPlayer, card);
}

// Clears a completed trick, letting its winner lead the next one, and ends the game if every hand is empty.
function clearTrick(state) {
  if (!state.trickWinner) return state;
  const roundOver = Object.values(state.hands).every((hand) => hand.length === 0);
  return {
    ...state,
    trick: { cards: {}, leadSuit: null },
    currentPlayer: state.trickWinner,
    trickWinner: null,
    gameOver: roundOver,
  };
}

module.exports = {
  PLAYERS,
  ROTATION,
  createGame,
  applyPlayCard,
  applyAiCard,
  clearTrick,
  legalCards,
};
