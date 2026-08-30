import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,Alert,
  Stack,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Unsubscribe as UnsubscribeIcon,
} from '@mui/icons-material';
import { formatDate } from '../utils/emailUtils';

function EmailDialog({ email, loading, sanitizedBody, onClose }) {
  return (
    <Dialog open={Boolean(email)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            noWrap
            sx={{ maxWidth: '90%' }}
          >
            {email?.subject}
          </Typography>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 5,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f8fafc',
              }}
            >
              <Typography>
                <strong>From:</strong> {email?.sender}
              </Typography>

              <Typography>
                <strong>Email:</strong> {email?.senderEmail}
              </Typography>

              <Typography>
                <strong>Received:</strong> {formatDate(email?.received)}
              </Typography>
  <Alert severity="info" sx={{ mb: 2 }}>
          Careful clicking on links including unsubscribe links!
        </Alert>
              {email?.unsubscribeLinks?.length > 0 && (
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1}
                  sx={{ mt: 2, flexWrap: 'wrap' }}
                >
                  <UnsubscribeIcon color="success" />

                  <Typography fontWeight="bold">
                    Unsubscribe:
                  </Typography>

                  {email.unsubscribeLinks.map((link) => (
                    <Button
                      key={link}
                      size="small"
                      variant="outlined"
                      color="success"
                      component="a"
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.startsWith('mailto:')
                        ? 'Email unsubscribe'
                        : 'Open unsubscribe'}
                    </Button>
                  ))}
                </Stack>
              )}
            </Paper>

            <Divider />

            <Box
              sx={{
                mt: 3,
                lineHeight: 1.6,
                overflowWrap: 'anywhere',
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                },
              }}
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EmailDialog;
