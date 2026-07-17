import React, { useMemo } from 'react';
import './play.css';
import { createDeck, shuffleDeck, dealCards } from './deck';

const PLAYERS = ['South', 'West', 'North', 'East'];

export function Play() {
  // Shuffle and deal once when the component mounts, rather than on every render.
  const hands = useMemo(() => {
    const deck = shuffleDeck(createDeck());
    return dealCards(deck, PLAYERS.length);
  }, []);

  const southHand = hands[PLAYERS.indexOf('South')];

  return (
    <main>
      <div id="info-area">
          <p>Trump Suit: ♣</p>
          <p>Team 1 Score: 5</p>
          <p>Team 2 Score: 2</p>
      </div>
      <div id="play-area">
        <section className="game-area-section">
          <div>
            <div className="card clubs">
              <div className="rank">4</div>
              <div className="suit">♣</div>
            </div>
          </div>
          <div>
            <div>
              <div className="card clubs">
                <div className="rank">Q</div>
                <div className="suit">♣</div>
              </div>
            </div>
            <div>
              <div className="card empty">
                <div className="rank"></div>
                <div className="suit"></div>
              </div>
            </div>
          </div>
          <div>
            <div className="card clubs">
              <div className="rank">A</div>
              <div className="suit">♣</div>
            </div>
          </div>
        </section>

        <section className="south-player game-area-section">
          {southHand.map((card, i) => (
            <div className={`card ${card.suit}`} key={i}>
              <div className="rank">{card.rank}</div>
              <div className="suit">{card.suitSymbol}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}