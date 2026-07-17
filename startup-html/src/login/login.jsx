import React from 'react';

import { Unauthenticated } from './unauthenticated';
import { Authenticated } from './authenticated';
import { AuthState } from './authState';

export function Login({ userName, authState, onAuthChange }) {
  // const navigate = useNavigate();

  return (
    <main>
      {/* <h1>Welcome to Summon the Dragon</h1>
      <p>Please login or create an account to continue</p>
      <form method="get" action="">
        <div className="input-group mb-3 w-50 mx-auto">
          <span className="input-group-text">Username: </span>
          <input className="form-control" type="text" placeholder="your username here" />
        </div>
        <div className="input-group mb-3 w-50 mx-auto">
          <span className="input-group-text">Password: </span>
          <input className="form-control" type="password" placeholder="your password here" />
        </div>
        <div className="text-center">
          <button className="btn btn-dark" type="submit">Login</button>
          <button className="btn btn-light" type="submit">Create</button>
        </div>
      </form> */}

      <div>
        {authState !== AuthState.Unknown && <h1>Welcome to Summon the Dragon</h1>}
        {authState === AuthState.Authenticated && (
          <Authenticated userName={userName} onLogout={() => onAuthChange(userName, AuthState.Unauthenticated)} />
        )}
        {authState === AuthState.Unauthenticated && (
          <Unauthenticated
            userName={userName}
            onLogin={(loginUserName) => {
              onAuthChange(loginUserName, AuthState.Authenticated);
            }}
          />
        )}
      </div>
    </main>
  );
}
