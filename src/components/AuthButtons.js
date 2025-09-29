import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogIn, LogOut, User } from 'lucide-react';
import './AuthButtons.css';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        // Auth0 Universal Login handles both login and signup
        prompt: 'login',
      }
    });
  };

  return (
    <button
      className="auth-button login-button"
      onClick={handleLogin}
    >
      <LogIn size={16} />
      <span>Log In / Sign Up</span>
    </button>
  );
};

const LogoutButton = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    // Always include PUBLIC_URL for consistency
    const returnTo = window.location.origin + (process.env.PUBLIC_URL || '');

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