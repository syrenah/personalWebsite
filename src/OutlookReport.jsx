import React, { useEffect, useState } from 'react';

import { PublicClientApplication } from '@azure/msal-browser';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { Email as EmailIcon, Security as SecurityIcon } from '@mui/icons-material';

import ReportShell from './components/ReportShell';
import Header from './components/Header';

import {
  getMessageBody,
  getMessageHeaders,
  getFolders,
  getMessages,
  moveMessageToDeletedItems,
  reportMessageAsJunk,
} from './services/microsoftGraph';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: 'eb418d25-b842-4377-bf39-c218b6459f51',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
});

function OutlookReport() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await msalInstance.initialize();

        const response = await msalInstance.handleRedirectPromise();

        if (response?.account) {
          setAccount(response.account);
          return;
        }

        const accounts = msalInstance.getAllAccounts();

        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    initialize();
  }, []);

  const login = async () => {
    try {
      setError(null);

      await msalInstance.loginRedirect({
        scopes: ['User.Read', 'Mail.ReadWrite'],
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const logout = async () => {
    await msalInstance.logoutRedirect();
  };

  

  const getAccessToken = async (user) => {
    const request = {
      scopes: ['User.Read', 'Mail.ReadWrite'],
      account: user,
    };

    try {
      const response = await msalInstance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (tokenError) {
      const code = tokenError?.errorCode || tokenError?.name;

      if (code === 'interaction_in_progress') {
        console.warn('MSAL interaction already in progress; skipping token redirect.');
        return null;
      }

      console.log('Silent token acquisition failed.');

      try {
        await msalInstance.acquireTokenRedirect(request);
      } catch (redirectError) {
        console.warn('Token redirect suppressed because an auth interaction is already active.', redirectError);
      }

      return null;
    }
  };

  const graphApi = {
    getMessages,
    getFolders,
    getMessageBody,
    getMessageHeaders,
    moveMessageToDeletedItems,
    reportMessageAsJunk,
  };

  if (!account) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
        }}
      >
        <Paper
          elevation={12}
          sx={{
            maxWidth: 500,
            width: '100%',
            p: 5,
            textAlign: 'center',
            borderRadius: 4,
          }}
        >
          <EmailIcon
            sx={{
              fontSize: 70,
              color: 'primary.main',
              mb: 2,
            }}
          />

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Syrenahs Outlook Portal
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Sign in with your Microsoft account to view your email report.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={login}
            startIcon={<SecurityIcon />}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Sign in with Microsoft
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <ReportShell
      account={account}
      getAccessToken={getAccessToken}
      graphApi={graphApi}
      onLogout={logout}
    />
  );
}

export default OutlookReport;
