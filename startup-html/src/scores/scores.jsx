import React from 'react';
import './scores.css';

export function Scores() {
  return (
    <main>
      <table className="table-striped table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Average Score</th>
            <th>Average Tricks</th>
            <th>Games Played</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Brian</td>
            <td>58 pts</td>
            <td>8.3</td>
            <td>14</td>
          </tr>
          <tr>
            <td>John</td>
            <td>21 pts</td>
            <td>3.6</td>
            <td>6</td>
          </tr>
          <tr>
            <td>Jane</td>
            <td>42 pts</td>
            <td>4.7</td>
            <td>5</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
