import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogIn, LogOut, User } from 'lucide-react';
import './AuthButtons.css';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        // Force showing the Auth0 Universal Login page with all options
        connection: undefined, // Don't specify a connection to show all options
        prompt: 'login', // Force login prompt
      }
    });
  };

  const handleEmailSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        // Force database connection for email/password signup
        connection: 'Username-Password-Authentication',
        screen_hint: 'signup'
      }
    });
  };

  return (
    <div className="auth-buttons-group">
      <button
        className="auth-button login-button"
        onClick={handleLogin}
      >
        <LogIn size={16} />
        <span>Log In</span>
      </button>
      <button
        className="auth-button signup-button"
        onClick={handleEmailSignup}
        title="Sign up with Email"
      >
        <User size={16} />
        <span>Sign Up with Email</span>
      </button>
    </div>
  );
};

const LogoutButton = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    const returnTo = window.location.hostname === 'localhost'
      ? window.location.origin
      : window.location.origin + (process.env.PUBLIC_URL || '');

    logout({
      logoutParams: {
        returnTo: returnTo
      }
    });
  };

  return (
    <button
      className="auth-button logout-button"
      onClick={handleLogout}
    >
      <LogOut size={16} />
      <span>Log Out</span>
    </button>
  );
};

const UserProfile = () => {
  const { user, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="user-profile">
      <User size={16} />
      <span>{user?.email || user?.name || 'User'}</span>
    </div>
  );
};

export { LoginButton, LogoutButton, UserProfile };