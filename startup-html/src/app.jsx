import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { AuthState } from './login/authState';
import { Play } from './play/play';
import { Scores } from './scores/scores';
import { About } from './about/about';
import { Lobby } from './lobby/lobby';

export default function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);


  return (
    <BrowserRouter>
      <div className="body bg-dark text-light">
        <header className="container-fluid">
          <nav className="navbar navbar-dark">
            <div className="navbar-brand">Summon the Dragon<sup>&reg;</sup></div>
            <menu className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Login
                </NavLink>
              </li>
              {authState === AuthState.Authenticated && (<li className="nav-item">
                <NavLink className="nav-link" to="lobby">
                  Lobby
                </NavLink>
              </li>)}
              {authState === AuthState.Authenticated && (<li className="nav-item">
                <NavLink className="nav-link" to="play">
                  Play
                </NavLink>
              </li>)}
              {authState === AuthState.Authenticated && (<li className="nav-item">
                <NavLink className="nav-link" to="scores">
                  Scores
                </NavLink>
              </li>)}
              <li className="nav-item">
                <NavLink className="nav-link" to="about">
                  About
                </NavLink>
              </li>
            </menu>
          </nav>
        </header>

        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/lobby' element={<Lobby />} />
          <Route path='/play' element={<Play />} />
          <Route path='/scores' element={<Scores />} />
          <Route path='/about' element={<About />} />
          <Route path='*' element={<NotFound />} />
        </Routes>

        <footer>
          <span className="text-reset">Brian Cate</span>
          <a href="https://github.com/briancate/startup">Github</a>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}