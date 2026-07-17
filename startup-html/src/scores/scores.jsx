import React from 'react';
import './scores.css';

export function Scores() {
  const [scores, setScores] = React.useState([]);

  // Demonstrates calling a service asynchronously so that
  // React can properly update state objects with the results.
  React.useEffect(() => {
    const scoresText = localStorage.getItem('scores');
    if (scoresText) {
      setScores(JSON.parse(scoresText));
    }
  }, []);

  // Demonstrates rendering an array with React
  const scoreRows = [];
  if (scores.length) {
    for (const [i, score] of scores.entries()) {
      scoreRows.push(
        <tr key={i}>
          <td>{i}</td>
          <td>{score.name}</td>
          <td>{score.score}</td>
          <td>{score.tricks}</td>
          <td>{score.games}</td>
        </tr>
      );
    }
  } else {
    scoreRows.push(
      // make this initialize with the user and 0 for everything?
      <tr key='0'>
        <td>0</td>
        <td>Joe</td>
        <td>{Math.floor(Math.random() * 100)}</td>
        <td>{Math.floor(Math.random() * 13)}</td>
        <td>{Math.floor(Math.random() * 20)}</td>
      </tr>
    );
  }

  return (
    <main className='container-fluid bg-secondary text-center'>
      <table className='table-striped table-bordered'>
        <thead className='table-dark'>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Average Score</th>
            <th>Average Tricks</th>
            <th>Games Played</th>
          </tr>
        </thead>
        <tbody id='scores'>{scoreRows}</tbody>
      </table>
    </main>
  );
}
