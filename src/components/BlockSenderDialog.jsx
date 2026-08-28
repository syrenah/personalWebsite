import React from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';

function BlockSenderDialog({ sender, loading, onClose, onConfirm }) {
  return (
    <Dialog
      open={Boolean(sender)}
      onClose={loading ? null : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" gap={1}>
          <BlockIcon color="error" />
          <Typography variant="h6" fontWeight="bold">
            Block sender?
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Are you sure you want to block this sender?
        </Typography>

        {sender && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: '#fff7f7',
              borderColor: 'error.light',
            }}
          >
            <Typography fontWeight="bold">{sender.sender}</Typography>
            <Typography variant="body2" color="text.secondary">
              {sender.senderEmail}
            </Typography>
          </Paper>
        )}

        <Alert severity="warning" sx={{ mt: 2 }}>
          Microsoft Graph will report one message from this sender as junk.
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <BlockIcon />
            )
          }
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Blocking...' : 'Block Sender'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BlockSenderDialog;
