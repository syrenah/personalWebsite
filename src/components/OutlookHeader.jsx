import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Email as EmailIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

function OutlookHeader({ account, loading, onRefresh, onLogout }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        background:
          'linear-gradient(135deg, #764ba2 0%, #d7aff8 100%)',
        color: 'white',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        gap={2}
      >
        <Box>
          <Stack direction="row" alignItems="center" gap={1}>
            <EmailIcon />
            <Typography variant="h5" fontWeight="bold">
              Emails Be Gone
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {account.name || account.username}
          </Typography>
        </Box>

        <Stack direction="row" gap={1}>
          <Button
            variant="contained"
            onClick={onRefresh}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
            sx={{
              backgroundColor: 'rgba(255,255,255,.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,.3)',
              },
            }}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            onClick={onLogout}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,.6)',
            }}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default OutlookHeader;
