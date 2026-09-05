import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { Email as EmailIcon, Security as SecurityIcon } from '@mui/icons-material';
import {
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  FetchRequestor,
  GRANT_TYPE_AUTHORIZATION_CODE,
  RedirectRequestHandler,
  TokenRequest,
} from '@openid/appauth';
import ReportShell from './components/ReportShell';
import { googleGraphService } from './services/googleGraph';

function GoogleReport() {
  const [account, setAccount] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [oauthReady, setOauthReady] = useState(false);
  const configurationRef = useRef(null);
  const authorizationHandlerRef = useRef(null);
  const redirectUri = window.location.origin;

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError('Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in your environment.');
      return undefined;
    }

    const notifier = new AuthorizationNotifier();
    const authorizationHandler = new RedirectRequestHandler();
    const fetchRequestor = new FetchRequestor();
    const tokenHandler = new BaseTokenRequestHandler(fetchRequestor);

    authorizationHandler.setAuthorizationNotifier(notifier);
    authorizationHandlerRef.current = authorizationHandler;

    notifier.setAuthorizationListener((request, response, authorizationError) => {
      if (authorizationError || !response?.code) {
        setError(authorizationError?.errorDescription || 'Google sign-in was not completed.');
        return;
      }

      const tokenRequest = new TokenRequest({
        client_id: clientId,
        redirect_uri: redirectUri,
        grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
        code: response.code,
        extras: {
          code_verifier: request.internal?.code_verifier,
        },
      });

      tokenHandler.performTokenRequest(configurationRef.current, tokenRequest)
        .then((tokenResponse) => {
          setAccessToken(tokenResponse.accessToken);
          return googleGraphService.getProfile(tokenResponse.accessToken);
        })
        .then((profile) => {
          setAccount({
            name: profile.name || 'Google Account',
            username: profile.email || 'Google account',
          });
        })
        .catch((tokenError) => setError(tokenError.message));
    });

    AuthorizationServiceConfiguration.fetchFromIssuer(
      'https://accounts.google.com',
      fetchRequestor
    )
      .then((configuration) => {
        configurationRef.current = configuration;
        setOauthReady(true);
        return authorizationHandler.completeAuthorizationRequestIfPossible();
      })
      .catch((configurationError) => setError(configurationError.message));

    return () => {
      authorizationHandlerRef.current = null;
    };
  }, []);

  const login = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError('Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in your environment.');
      return;
    }

    if (!oauthReady || !configurationRef.current || !authorizationHandlerRef.current) {
      setError('Google sign-in is still loading. Please try again in a moment.');
      return;
    }

    const request = new AuthorizationRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
      state: undefined,
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.modify',
      ].join(' '),
      extras: {
        access_type: 'offline',
        prompt: 'consent',
      },
    });

    authorizationHandlerRef.current.performAuthorizationRequest(
      configurationRef.current,
      request
    );
  };

  const logout = () => {
    setAccount(null);
    setAccessToken(null);
  };

  if (!account) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
        }}
      >
        <Paper elevation={12} sx={{ maxWidth: 500, width: '100%', p: 5, textAlign: 'center', borderRadius: 4 }}>
          <EmailIcon sx={{ fontSize: 70, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Syrenahs Google Portal
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Sign in with your Google account to view your email report.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <Button
            variant="contained"
            size="large"
            onClick={login}
            startIcon={<SecurityIcon />}
            sx={{ borderRadius: 3, px: 4, py: 1.5, textTransform: 'none', fontSize: '1rem' }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    );
  }

  const graphApi = {
    googleGraphService,
    getMessages: async () => [],
    getFolders: async () => null,
    getMessageBody: async () => ({ body: { content: '' } }),
    getMessageHeaders: async () => ({ internetMessageHeaders: [] }),
    moveMessageToDeletedItems: async () => undefined,
    reportMessageAsJunk: async () => undefined,
  };

  return (
    <ReportShell
      account={account}
      getAccessToken={async () => accessToken}
      graphApi={graphApi}
      onLogout={logout}
      header={<div />}
    />
  );
}

export default GoogleReport;
