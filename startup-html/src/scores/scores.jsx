import React from 'react';
import './scores.css';
// import { getGameHistory } from '../gameHistory';

export function Scores() {

  const [scores, setScores] = React.useState([]);

  // Demonstrates calling a service asynchronously so that
  // React can properly update state objects with the results.
  React.useEffect(() => {
    fetch('/api/scores')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load scores'); 
        return response.json();
      })
      .then((scores) => {setScores(scores)})
      .catch((err) => console.error(err));
  }, []);

  // Demonstrates rendering an array with React
  const scoreRows = [];
  if (scores.length) {
    for (const [i, score] of scores.entries()) {
      if (score == null) continue;
      scoreRows.push(
        <tr key={i+1}>
          <td>{i+1}</td>
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
      </table>
    </main>
  );
}