import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Shield, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import './Auth0TestPage.css';

const Auth0TestPage = () => {
  const {
    isAuthenticated,
    isLoading,
    error,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    loginWithPopup,
    getIdTokenClaims
  } = useAuth0();

  const [testResults, setTestResults] = useState({});
  const [accessToken, setAccessToken] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  useEffect(() => {
    if (error) {
      addLog(`Auth0 Error: ${error.message}`, 'error');
    }
  }, [error]);

  // Test login with redirect
  const testLoginRedirect = async () => {
    addLog('Testing login with redirect...', 'info');
    try {
      await loginWithRedirect({
        authorizationParams: {
          prompt: 'login'
        }
      });
      addLog('Redirect initiated', 'success');
    } catch (err) {
      addLog(`Redirect failed: ${err.message}`, 'error');
    }
  };

  // Test login with popup
  const testLoginPopup = async () => {
    addLog('Testing login with popup...', 'info');
    try {
      await loginWithPopup();
      addLog('Popup login successful', 'success');
    } catch (err) {
      addLog(`Popup failed: ${err.message}`, 'error');
    }
  };

  // Test signup
  const testSignup = async () => {
    addLog('Testing signup redirect...', 'info');
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          connection: 'Username-Password-Authentication'
        }
      });
      addLog('Signup redirect initiated', 'success');
    } catch (err) {
      addLog(`Signup failed: ${err.message}`, 'error');
      console.error('Full signup error:', err);

      // Check if error has additional details
      if (err.error_description) {
        addLog(`Error details: ${err.error_description}`, 'error');
      }
      if (err.statusCode) {
        addLog(`Status code: ${err.statusCode}`, 'error');
      }
    }
  };

  // Test get access token
  const testGetToken = async () => {
    addLog('Getting access token...', 'info');
    try {
      const token = await getAccessTokenSilently();
      setAccessToken(token);
      addLog('Access token retrieved', 'success');

      // Decode token
      const payload = JSON.parse(atob(token.split('.')[1]));
      addLog(`Token expires at: ${new Date(payload.exp * 1000).toLocaleString()}`, 'info');
    } catch (err) {
      addLog(`Failed to get token: ${err.message}`, 'error');
    }
  };

  // Test get ID token
  const testGetIdToken = async () => {
    addLog('Getting ID token claims...', 'info');
    try {
      const claims = await getIdTokenClaims();
      setIdToken(claims);
      addLog('ID token claims retrieved', 'success');
    } catch (err) {
      addLog(`Failed to get ID token: ${err.message}`, 'error');
    }
  };

  // Direct Auth0 URL test
  const testDirectAuth0 = () => {
    const domain = process.env.REACT_APP_AUTH0_DOMAIN;
    const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
    const redirectUri = window.location.origin + process.env.PUBLIC_URL;

    const authUrl = `https://${domain}/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=openid%20profile%20email`;

    addLog(`Direct Auth0 URL: ${authUrl}`, 'info');
    window.open(authUrl, '_blank');
  };

  // Test database connection settings
  const testDatabaseConnection = async () => {
    addLog('Checking database connection settings...', 'info');
    const domain = process.env.REACT_APP_AUTH0_DOMAIN;

    try {
      // Try to get the client configuration
      const response = await fetch(`https://${domain}/client/${process.env.REACT_APP_AUTH0_CLIENT_ID}.js`);

      if (response.ok) {
        addLog('Client configuration accessible', 'success');
      } else {
        addLog(`Client config check failed: ${response.status} ${response.statusText}`, 'error');
      }

      // Log important configuration
      addLog('Database Connection: Username-Password-Authentication', 'info');
      addLog(`Domain: ${domain}`, 'info');
      addLog(`Client ID: ${process.env.REACT_APP_AUTH0_CLIENT_ID}`, 'info');
    } catch (err) {
      addLog(`Connection test failed: ${err.message}`, 'error');
    }
  };

  // Test logout
  const testLogout = () => {
    addLog('Testing logout...', 'info');
    logout({
      logoutParams: {
        returnTo: window.location.origin + process.env.PUBLIC_URL
      }
    });
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    setAccessToken(null);
    setIdToken(null);
  };

  return (
    <div className="auth0-test-page">
      <div className="test-header">
        <Shield size={32} />
        <h1>Auth0 Configuration Test Page</h1>
      </div>

      {/* Environment Configuration */}
      <div className="test-section">
        <h2>Environment Configuration</h2>
        <div className="config-grid">
          <div className="config-item">
            <span className="label">Auth0 Domain:</span>
            <code>{process.env.REACT_APP_AUTH0_DOMAIN || 'Not configured'}</code>
          </div>
          <div className="config-item">
            <span className="label">Client ID:</span>
            <code>{process.env.REACT_APP_AUTH0_CLIENT_ID || 'Not configured'}</code>
          </div>
          <div className="config-item">
            <span className="label">Redirect URI:</span>
            <code>{window.location.origin + (process.env.PUBLIC_URL || '')}</code>
          </div>
          <div className="config-item">
            <span className="label">Auth Bypass:</span>
            <code>{process.env.REACT_APP_BYPASS_AUTH || 'false'}</code>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="test-section">
        <h2>Current Status</h2>
        <div className="status-grid">
          <div className={`status-item ${isLoading ? 'loading' : ''}`}>
            <span className="label">Loading:</span>
            <span className="value">{isLoading ? <RefreshCw className="spin" size={16} /> : 'No'}</span>
          </div>
          <div className={`status-item ${isAuthenticated ? 'success' : 'error'}`}>
            <span className="label">Authenticated:</span>
            <span className="value">
              {isAuthenticated ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {isAuthenticated ? 'Yes' : 'No'}
            </span>
          </div>
          <div className={`status-item ${error ? 'error' : ''}`}>
            <span className="label">Error:</span>
            <span className="value">{error ? error.message : 'None'}</span>
          </div>
        </div>
      </div>

      {/* User Information */}
      {user && (
        <div className="test-section">
          <h2>User Information</h2>
          <div className="user-info">
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Test Actions */}
      <div className="test-section">
        <h2>Test Actions</h2>
        <div className="test-actions">
          {!isAuthenticated ? (
            <>
              <button onClick={testLoginRedirect} className="test-button login">
                Test Login (Redirect)
              </button>
              <button onClick={testLoginPopup} className="test-button login">
                Test Login (Popup)
              </button>
              <button onClick={testSignup} className="test-button signup">
                Test Signup
              </button>
              <button onClick={testDirectAuth0} className="test-button direct">
                Test Direct Auth0 URL
              </button>
              <button onClick={testDatabaseConnection} className="test-button token">
                Check DB Connection
              </button>
            </>
          ) : (
            <>
              <button onClick={testGetToken} className="test-button token">
                Get Access Token
              </button>
              <button onClick={testGetIdToken} className="test-button token">
                Get ID Token Claims
              </button>
              <button onClick={testLogout} className="test-button logout">
                Test Logout
              </button>
            </>
          )}
          <button onClick={clearLogs} className="test-button clear">
            Clear Logs
          </button>
        </div>
      </div>

      {/* Tokens Display */}
      {(accessToken || idToken) && (
        <div className="test-section">
          <h2>Tokens</h2>
          {accessToken && (
            <div className="token-display">
              <h3>Access Token (truncated)</h3>
              <code>{accessToken.substring(0, 50)}...</code>
            </div>
          )}
          {idToken && (
            <div className="token-display">
              <h3>ID Token Claims</h3>
              <pre>{JSON.stringify(idToken, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Activity Logs */}
      <div className="test-section">
        <h2>Activity Logs</h2>
        <div className="logs-container">
          {logs.length === 0 ? (
            <p className="no-logs">No activity yet. Try some test actions.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`log-entry ${log.type}`}>
                <span className="log-time">[{log.timestamp}]</span>
                <span className="log-message">{log.message}</span>
                {log.type === 'error' && <AlertCircle size={14} />}
                {log.type === 'success' && <CheckCircle size={14} />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="test-section">
        <h2>Troubleshooting Tips</h2>
        <div className="tips">
          <p><strong>Common Issues:</strong></p>
          <ul>
            <li>Check browser console for detailed errors (F12)</li>
            <li>Ensure popups are not blocked for popup login test</li>
            <li>Verify Auth0 application settings match redirect URI</li>
            <li>Check if "Disable Sign Ups" is turned OFF in Auth0 Database settings</li>
            <li>Review Auth0 logs in dashboard for server-side errors</li>
            <li>Try incognito mode to bypass cache issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Auth0TestPage;