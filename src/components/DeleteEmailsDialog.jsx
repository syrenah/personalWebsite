import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatDate } from '../utils/emailUtils';

function DeleteEmailsDialog({
  open,
  emails,
  selectedEmails,
  onClose,
  onConfirm,
  onRemoveEmail,
  onEmailClick,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
                sx={{
                  p: 1.5,
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => onEmailClick(email)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onEmailClick(email);
                    }
                  }}
                  sx={{
                    minWidth: 0,
                    flexGrow: 1,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.75 },
                  }}
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

                <IconButton
                  size="small"
                  aria-label={`Remove ${email.subject} from deletion list`}
                  color="error"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveEmail(email.id);
                  }}
                  sx={{ mt: 0.25 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
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
        <Button onClick={onClose} >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={
              <DeleteIcon /> 
          
          }
          onClick={onConfirm}
        
        >
      Move
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteEmailsDialog;
