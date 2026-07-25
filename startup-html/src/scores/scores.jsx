import React from 'react';
import './scores.css';
import { getGameHistory } from '../gameHistory';

export function Scores() {

  const [scores, setScores] = React.useState([]);

  // Demonstrates calling a service asynchronously so that
  // React can properly update state objects with the results.
  React.useEffect(() => {
    fetch('/api/scores')
      .then((response) => response.json())
      .then((scores) => {
        setScores(scores);
      });
  }, []);

  // Demonstrates rendering an array with React
  const scoreRows = [];
  if (scores.length) {
    for (const [i, score] of scores.entries()) {
      scoreRows.push(
        <tr key={i}>
          <td>{i}</td>
          <td>{score.team1Score}</td>
          <td>{score.team2Score}</td>
        </tr>
      );
    }
  } else {
    scoreRows.push(
      <tr key='0'>
        <td colSpan='4'>No games played yet</td>
      </tr>
    );
  }

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
        <tbody id='scores'>{scoreRows}</tbody>
        {/* <tbody>   // LEAVING THIS COMMENTED OUT ON PURPOSE, trying to follow Simon's pattern but keeping this just in case
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
        </tbody> */}
      </table>
    </main>
  );
}