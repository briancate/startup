import React, { useEffect, useRef, useState } from 'react';
import './play.css';
import { connectToGame } from './gameSocket';
// import { saveGameResult } from '../gameHistory';

const SEATS = ['South', 'West', 'North', 'East'];

function isSameCard(a, b) {
  return a.suit === b.suit && a.rank === b.rank;
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
  const [state, setState] = useState(null);
  const connectionRef = useRef(null);
  const savedRef = useRef(false);

  useEffect(() => {
    const connection = connectToGame();
    connectionRef.current = connection;
    connection.onMessage((message) => {
      if (message.type === 'state') setState(message);
    });
    return () => connection.close();
  }, []);

  // Record the final score exactly once when a game ends.
  useEffect(() => {
    if (!state || !state.started) return;
    if (!state.gameOver) {
      savedRef.current = false;
      return;
    }
    if (savedRef.current) return;
    savedRef.current = true;

    const higherScore = state.team1Score > state.team2Score ? state.team1Score : state.team2Score;
    saveScore(state.team1Score, state.team2Score, higherScore);
  }, [state]);

  async function saveScore(team1Score, team2Score, higherScore) {
    const newScore = { team1Score, team2Score, higherScore };

    await fetch('/api/score', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newScore),
    });
  }

  function playCard(card) {
    connectionRef.current.send('playCard', { card: { suit: card.suit, rank: card.rank } });
  }

  function startGame() {
    connectionRef.current.send('startGame', {});
  }

  if (!state) {
    return (
      <main>
        <div id="info-area">
          <p>Connecting to game...</p>
        </div>
      </main>
    );
  }

  const isObserver = state.role === 'observer';
  const mySeatLabel = isObserver ? 'You are observing this game' : `You are seated: ${state.seat}`;
  const displayName = (seat) => (state.seats[seat] && state.seats[seat].name) || seat;

  if (!state.started) {
    return (
      <main>
        <div id="info-area">
          <p>{mySeatLabel}</p>
        </div>
        <div id="play-area">
          <section className="game-area-section">
            <div>
              <h2>Waiting to start</h2>
              <ul>
                {SEATS.map((seat) => (
                  <li key={seat}>
                    {seat}: {state.seats[seat].connected ? state.seats[seat].name || 'Player connected' : 'Open (AI will play)'}
                    {seat === state.seat ? ' (you)' : ''}
                  </li>
                ))}
              </ul>
              {state.observerCount > 0 && <p>{state.observerCount} observer(s) connected</p>}
              <button onClick={startGame}>Start Game</button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const isMyCardLegal = (card) => !isObserver && state.legalCards.some((legal) => isSameCard(legal, card));

  const turnLabel = state.gameOver
    ? 'Game over!'
    : state.trickWinner
    ? `${displayName(state.trickWinner)} wins the trick!`
    : state.currentPlayer === state.seat
    ? 'Your turn'
    : `${displayName(state.currentPlayer)} is playing...`;

  const winningTeamLabel =
    state.team1Score === state.team2Score ? 'Tie game' : state.team1Score > state.team2Score ? 'Team 1' : 'Team 2';

  return (
    <main>
      <div id="info-area">
        <p>{mySeatLabel}</p>
        <p>Trump Suit: {state.trumpSuit.symbol}</p>
        <p>{turnLabel}</p>
        <p>Team 1 Score: {state.team1Score}</p>
        <p>Team 2 Score: {state.team2Score}</p>
      </div>
      <div id="play-area">
        <section className="game-area-section">
          <div>
            <TrickSlot card={state.trick.cards.West} />
          </div>
          <div>
            <div>
              <TrickSlot card={state.trick.cards.North} />
            </div>
            <div>
              <TrickSlot card={state.trick.cards.South} />
            </div>
          </div>
          <div>
            <TrickSlot card={state.trick.cards.East} />
          </div>
        </section>

        {isObserver ? (
          <section className="game-area-section">
            <p>Observing — no hand to play</p>
          </section>
        ) : (
          <section className="south-player game-area-section">
            {state.hand.map((card, i) => {
              const isLegal = isMyCardLegal(card);
              return (
                <Card
                  card={card}
                  key={i}
                  className={isLegal ? '' : 'disabled'}
                  onClick={isLegal ? () => playCard(card) : undefined}
                />
              );
            })}
          </section>
        )}

        {state.gameOver && (
          <div className="game-over">
            <p>
              {winningTeamLabel === 'Tie game' ? 'Tie game!' : `${winningTeamLabel} wins the game!`}{' '}
              ({state.team1Score} - {state.team2Score})
            </p>
            <button onClick={startGame}>Start New Game</button>
          </div>
        )}
      </div>
    </main>
  );
}
