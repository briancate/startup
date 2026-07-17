import React, { useState } from 'react';
import './play.css';
import { createDeck, shuffleDeck, dealCards, SUITS, RANKS } from './deck';

const PLAYERS = ['South', 'West', 'North', 'East'];
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
    centerCards: {
      West: randomCard(hands.West),
      North: randomCard(hands.North),
      East: randomCard(hands.East),
    },
    southPlayed: null,
  };
}

function Card({ card, ...props }) {
  return (
    <div className={`card ${card.suit}`} {...props}>
      <div className="rank">{card.rank}</div>
      <div className="suit">{card.suitSymbol}</div>
    </div>
  );
}

export function Play() {
  // Shuffle and deal once when the component mounts, rather than on every render.
  const [game, setGame] = useState(dealNewGame);
  const [team1Score] = useState(0);
  const [team2Score] = useState(0);

  function playSouthCard(card) {
    setGame((prev) => ({
      ...prev,
      southPlayed: card,
      hands: {
        ...prev.hands,
        South: prev.hands.South.filter((c) => c !== card),
      },
    }));
  }

  return (
    <main>
      <div id="info-area">
          <p>Trump Suit: {game.trumpSuit.symbol}</p>
          <p>Team 1 Score: {team1Score}</p>
          <p>Team 2 Score: {team2Score}</p>
      </div>
      <div id="play-area">
        <section className="game-area-section">
          <div>
            <Card card={game.centerCards.West} />
          </div>
          <div>
            <div>
              <Card card={game.centerCards.North} />
            </div>
            <div>
              {game.southPlayed ? (
                <Card card={game.southPlayed} />
              ) : (
                <div className="card empty">
                  <div className="rank"></div>
                  <div className="suit"></div>
                </div>
              )}
            </div>
          </div>
          <div>
            <Card card={game.centerCards.East} />
          </div>
        </section>

        <section className="south-player game-area-section">
          {game.hands.South.map((card, i) => (
            <Card card={card} key={i} onClick={() => playSouthCard(card)} />
          ))}
        </section>
      </div>
    </main>
  );
}