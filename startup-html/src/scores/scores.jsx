import React from 'react';
import './scores.css';
import { getGameHistory } from '../gameHistory';

export function Scores() {
  const history = getGameHistory();

  return (
    <main>
      <table className="table-striped table-bordered">
        <thead>
          <tr>
            <th>Game #</th>
            <th>Team 1 Score</th>
            <th>Team 2 Score</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="3">No games played yet</td>
            </tr>
          ) : (
            history.map((entry) => (
              <tr key={entry.game}>
                <td>{entry.game}</td>
                <td>{entry.team1Score}</td>
                <td>{entry.team2Score}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}