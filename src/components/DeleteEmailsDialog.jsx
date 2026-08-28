import React from 'react';
import {
  Alert,
  Box,
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
import { Delete as DeleteIcon } from '@mui/icons-material';
import { formatDate } from '../utils/emailUtils';

function DeleteEmailsDialog({
  open,
  emails,
  selectedEmails,
  loading,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" gap={1}>
          <DeleteIcon color="error" />
          <Typography variant="h6" fontWeight="bold">
            Move emails to Deleted Items?
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          These emails will be moved to your Microsoft Outlook Deleted Items
          folder. They are not being permanently deleted.
        </Alert>

        <Typography fontWeight="bold" sx={{ mb: 1 }}>
          Emails selected:
        </Typography>

        <Paper
          variant="outlined"
          sx={{ maxHeight: 350, overflow: 'auto' }}
        >
          {selectedEmails.map((emailId) => {
            const email = emails.find((item) => item.id === emailId);

            if (!email) return null;

            return (
              <Box
                key={email.id}
                sx={{ p: 1.5, borderBottom: '1px solid #eee' }}
              >
                <Typography fontWeight="bold" noWrap>
                  {email.subject}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                >
                  {email.senderEmail}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(email.received)}
                </Typography>
              </Box>
            );
          })}
        </Paper>

        <Typography sx={{ mt: 2 }}>
          Are you sure you want to move{' '}
          <strong>{selectedEmails.length}</strong>{' '}
          email{selectedEmails.length === 1 ? '' : 's'} to Deleted Items?
        </Typography>
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
              <DeleteIcon />
            )
          }
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Moving...' : 'Move to Deleted Items'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteEmailsDialog;
