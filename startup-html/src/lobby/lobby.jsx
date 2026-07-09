import React from 'react';
import './lobby.css';

export function Lobby() {
  return (
    <main>
      <div>To start a game, please join a lobby</div>
      <div className="lobby-holder">
        <span>Lobby 1</span>
        <span>3/4 Players</span>
        <button className="btn btn-dark" type="join lobby">Join</button>
      </div>
      
      <div className="lobby-holder">
        <span>Lobby 2</span>
        <span>1/4 Players</span>
        <button className="btn btn-dark" type="join lobby">Join</button>
      </div>

      <div className="lobby-holder">
        <span>Lobby 3</span>
        <span>4/4 Players</span>
        <button disabled className="btn btn-light" type="join lobby">Full</button>
      </div>
    </main>
  );
}
