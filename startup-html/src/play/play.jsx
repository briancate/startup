import React, { useCallback, useEffect, useState } from 'react';
import './play.css';
import { createDeck, shuffleDeck, dealCards, SUITS, RANKS } from './deck';


const PLAYERS = ['South', 'West', 'North', 'East'];
const ROTATION = ['West', 'North', 'East', 'South'];
const SUIT_ORDER = SUITS.map((suit) => suit.name);


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
function legalCards(hand, leadSuit, trumpSuit) {
  if (!leadSuit) return hand;
  const followSuit = hand.filter((c) => c.suit === leadSuit);
  if (followSuit.length > 0) return followSuit;
  const trumpCards = hand.filter((c) => c.suit === trumpSuit);
  if (trumpCards.length > 0) return trumpCards;
  return hand;
}


function chooseAiCard(hand, leadSuit, trumpSuit) {
  return randomCard(legalCards(hand, leadSuit, trumpSuit));
}


// Highest trump played wins the trick; if no trump was played, highest card of the lead suit wins.
function getTrickWinner(trickCards, leadSuit, trumpSuit) {
  const entries = Object.entries(trickCards);
  const trumpEntries = entries.filter(([, card]) => card.suit === trumpSuit);
  const contest = trumpEntries.length > 0 ? trumpEntries : entries.filter(([, card]) => card.suit === leadSuit);
  return contest.reduce((best, entry) => (RANKS.indexOf(entry[1].rank) > RANKS.indexOf(best[1].rank) ? entry : best))[0];
}


function dealNewGame() {
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
  };
}


function Card({ card, className = '', ...props }) {
  return (
    <div className={`card ${card.suit} ${className}`.trim()} {...props}>
      <div className="rank">{card.rank}</div>
      <div className="suit">{card.suitSymbol}</div>
    </div>
  );
}


function TrickSlot({ card }) {
  if (!card) {
    return (
      <div className="card empty">
        <div className="rank"></div>
        <div className="suit"></div>
      </div>
    );
  }
  return <Card card={card} />;
}


export function Play() {
  const [game, setGame] = useState(dealNewGame);


  const playCard = useCallback((player, card) => {
    setGame((prev) => {
      if (prev.trickWinner || prev.currentPlayer !== player) return prev;


      const hands = { ...prev.hands, [player]: prev.hands[player].filter((c) => c !== card) };
      const isLead = Object.keys(prev.trick.cards).length === 0;
      const leadSuit = isLead ? card.suit : prev.trick.leadSuit;
      const cards = { ...prev.trick.cards, [player]: card };


      if (Object.keys(cards).length < ROTATION.length) {
        return { ...prev, hands, trick: { cards, leadSuit }, currentPlayer: nextPlayer(player) };
      }


      const winner = getTrickWinner(cards, leadSuit, prev.trumpSuit);
      const team = teamOf(winner);
      return {
        ...prev,
        hands,
        trick: { cards, leadSuit },
        trickWinner: winner,
        team1Score: prev.team1Score + (team === 1 ? 1 : 0),
        team2Score: prev.team2Score + (team === 2 ? 1 : 0),
      };
    });
  }, []);


  // Briefly show the completed trick, then let the winner lead the next one.
  useEffect(() => {
    if (!game.trickWinner) return;
    const timer = setTimeout(() => {
      setGame((prev) => ({
        ...prev,
        trick: { cards: {}, leadSuit: null },
        currentPlayer: prev.trickWinner,
        trickWinner: null,
      }));
    }, 1200);
    return () => clearTimeout(timer);
  }, [game.trickWinner]);


  // Auto-play for West/North/East on their turn.
  useEffect(() => {
    if (game.trickWinner || game.currentPlayer === 'South') return;
    const hand = game.hands[game.currentPlayer];
    if (hand.length === 0) return;
    const timer = setTimeout(() => {
      const card = chooseAiCard(hand, game.trick.leadSuit, game.trumpSuit);
      playCard(game.currentPlayer, card);
    }, 700);
    return () => clearTimeout(timer);
  }, [game.currentPlayer, game.trickWinner, game.hands, game.trick.leadSuit, game.trumpSuit, playCard]);


  const canPlaySouth = game.currentPlayer === 'South' && !game.trickWinner;
  const legalSouthCards = canPlaySouth ? legalCards(game.hands.South, game.trick.leadSuit, game.trumpSuit) : [];


  const turnLabel = game.trickWinner
    ? `${game.trickWinner} wins the trick!`
    : game.currentPlayer === 'South'
    ? 'Your turn'
    : `${game.currentPlayer} is playing...`;


  return (
    <main>
      <div id="info-area">
          <p>Trump Suit: {game.trumpSuit.symbol}</p>
          <p>{turnLabel}</p>
          <p>Team 1 Score: {game.team1Score}</p>
          <p>Team 2 Score: {game.team2Score}</p>
      </div>
      <div id="play-area">
        <section className="game-area-section">
          <div>
            <TrickSlot card={game.trick.cards.West} />
          </div>
          <div>
            <div>
              <TrickSlot card={game.trick.cards.North} />
            </div>
            <div>
              <TrickSlot card={game.trick.cards.South} />
            </div>
          </div>
          <div>
            <TrickSlot card={game.trick.cards.East} />
          </div>
        </section>


        <section className="south-player game-area-section">
          {game.hands.South.map((card, i) => {
            const isLegal = legalSouthCards.includes(card);
            return (
              <Card
                card={card}
                key={i}
                className={isLegal ? '' : 'disabled'}
                onClick={isLegal ? () => playCard('South', card) : undefined}
              />
            );
          })}
        </section>
      </div>
    </main>
  );
}



