import React from 'react';

export function Login() {
  return (
    <main>
      <h1>Welcome to Summon the Dragon</h1>
      <p>Please login or create an account to continue</p>
      <form method="get" action="play.html">
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
      </form>
    </main>
  );
}
