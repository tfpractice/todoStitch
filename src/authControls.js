import React from 'react';
import { render, } from 'react-dom';
import { Link, } from 'react-router-dom';

const AuthControls = ({ client, }) => {
  const authed = !!client.authedId();
  const logout = () => client.logout().then(() => location.reload());
  const login = () => client.login().then(() => location.reload());

  return (
    <div className="login-header">
      {authed
        ? <a className="logout" href="#" onClick={logout}>
            sign out
        </a>
        : <div className="login-links-panel">
          <h2>TODO</h2>
          <div onClick={login} className="signin-button">
            <span className="signin-button-text">Sign in Anonymously</span>
          </div>
        </div>}
    </div>
  );
};

export default AuthControls;
