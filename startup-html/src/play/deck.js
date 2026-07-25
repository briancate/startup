// Coutesy of Claude

export const SUITS = [
  { name: 'clubs', symbol: '♣' },
  { name: 'diamonds', symbol: '♦' },
  { name: 'spades', symbol: '♠' },
  { name: 'hearts', symbol: '♥' },
];

export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit: suit.name, suitSymbol: suit.symbol });
    }
  }
  return deck;
}

// Fisher-Yates shuffle. Returns a new shuffled array; does not mutate the input.
// add link to Wikipedia ?
export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Splits a deck evenly across players, dealing one card at a time in round-robin order.
export function dealCards(deck, numPlayers) {
  const hands = Array.from({ length: numPlayers }, () => []);
  deck.forEach((card, i) => {
    hands[i % numPlayers].push(card);
  });
  return hands;
}