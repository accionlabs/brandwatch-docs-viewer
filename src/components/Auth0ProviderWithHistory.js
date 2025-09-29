import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

const Auth0ProviderWithHistory = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

  // Use PUBLIC_URL for GitHub Pages deployment
  const getRedirectUri = () => {
    // Always include PUBLIC_URL if it exists, even for localhost
    const baseUrl = window.location.origin;
    const publicUrl = process.env.PUBLIC_URL || '';

    // For development, we might want to use the full path
    if (window.location.hostname === 'localhost' && publicUrl) {
      // Use localhost:3000/brandwatch-docs-viewer for consistency
      return baseUrl + publicUrl;
    } else if (window.location.hostname === 'localhost') {
      // Fallback to just origin if PUBLIC_URL not set
      return baseUrl;
    }

    // For production (GitHub Pages), always include the repository path
    return baseUrl + publicUrl;
  };

  const onRedirectCallback = (appState) => {
    // Use window.history to navigate to the returnTo URL or default to home
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname
    );
  };

  if (!domain || !clientId) {
    console.error('Auth0 configuration missing. Please set REACT_APP_AUTH0_DOMAIN and REACT_APP_AUTH0_CLIENT_ID environment variables.');
    return <div>{children}</div>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: getRedirectUri(),
        audience: `https://${domain}/api/v2/`,
        scope: "openid profile email"
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;