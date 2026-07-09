import React from 'react';
import './play.css';

export function Play() {
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
          <div className="card clubs">
            <div className="rank">8</div>
            <div className="suit">♣</div>
          </div>
          <div className="card diamonds">
            <div className="rank">4</div>
            <div className="suit">♦</div>
          </div>
          <div className="card spades">
            <div className="rank">A</div>
            <div className="suit">♠</div>
          </div>
          <div className="card hearts">
            <div className="rank">Q</div>
            <div className="suit">♥</div>
          </div>
          <div className="card hearts">
            <div className="rank">2</div>
            <div className="suit">♥</div>
          </div>
        </section>
      </div>
    </main>
  );
}
