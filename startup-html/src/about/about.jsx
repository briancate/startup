import React from 'react';
import './about.css';

export function About() {
  return (
    <main>
      <div id="picture" className="picture-box">
        <img alt="Dr. Stephen Smith" src="dr_smith.jpg" />
        <p>
            Summon the Dragon is an open bidding trump game designed so that you can't say, "I never get a hand I can bid on."
        </p>
        <p>
            The name Summon the Dragon is a registered trademark of Stephen Claude Smith's Xenith Creativity Co. My use of the name and the game is for non-profit
            educational use only. No part of this code or program should be used outside of that definition.
        </p>
      </div>
    </main>
  );
}
