import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
    <div className="body bg-dark text-light">
      <header class="container-fluid">
        <nav class="navbar navbar-dark">
          <a class="navbar-brand" href="#">Summon the Dragon<sup>&reg;</sup></a>
          <menu class="navbar-nav">
            <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="lobby.html">Lobby</a></li>
            <li class="nav-item"><a class="nav-link" href="play.html">Play</a></li>
            <li class="nav-item"><a class="nav-link" href="scores.html">Scores</a></li>
            <li class="nav-item"><a class="nav-link" href="about.html">About</a></li>
          </menu>
        </nav>
      </header>

      <main>Main stuff should be here</main>

      <footer>
        <span class="text-reset">Brian Cate</span>
        <a href="https://github.com/briancate/startup">Github</a>
      </footer>
    </div>

  );
}
