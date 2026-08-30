import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  Block as BlockIcon,
  Email as EmailIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

function SenderReport({
  senders,
  selectedSenders,
  onSenderToggle,
  onBlockSender,
  getUnsubscribeLinks,
}) {
  const [unsubscribeDialogOpen, setUnsubscribeDialogOpen] =
    useState(false);

  const [selectedSender, setSelectedSender] = useState(null);

  const [unsubscribeLinks, setUnsubscribeLinks] = useState([]);

  const [loadingUnsubscribe, setLoadingUnsubscribe] =
    useState(false);

  const handleUnsubscribeClick = async (
    event,
    senderEmail
  ) => {
    event.stopPropagation();

    console.log(
      'UNSUBSCRIBE CLICKED:',
      senderEmail
    );

    setSelectedSender(senderEmail);
    setUnsubscribeLinks([]);
    setUnsubscribeDialogOpen(true);
    setLoadingUnsubscribe(true);

    try {
      console.log(
        'Calling getUnsubscribeLinks:',
        senderEmail
      );

      const links = await getUnsubscribeLinks(
        senderEmail
      );

      console.log('Returned links:', links);

      setUnsubscribeLinks(links || []);
    } catch (error) {
      console.error(
        'Unable to get unsubscribe links:',
        error
      );

      setUnsubscribeLinks([]);
    } finally {
      setLoadingUnsubscribe(false);
    }
  };

  const handleCloseUnsubscribeDialog = () => {
    setUnsubscribeDialogOpen(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background:
            'linear-gradient(90deg, #e3b3ff, #fdf4ff)',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
          >
            Senders
          </Typography>

          <Chip
            size="small"
            label={`${senders.length} senders`}
            sx={{
              background: '#7209c9',
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Select senders to filter the email table.
        </Typography>

        {/* Selected sender pills */}
        {selectedSenders.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Stack
              direction="row"
              spacing={0.75}
              useFlexGap
              flexWrap="wrap"
            >
              {selectedSenders.map((email) => {
                const senderInfo = senders.find(
                  (item) =>
                    item.senderEmail === email
                );

                return (
                  <Chip
                    key={email}
                    label={
                      senderInfo?.sender || email
                    }
                    size="small"
                    onDelete={() =>
                      onSenderToggle(email)
                    }
                    sx={{
                      background: '#7209c9',
                      color: 'white',
                      fontWeight: 500,

                      '& .MuiChip-deleteIcon': {
                        color:
                          'rgba(255,255,255,0.75)',
                        fontSize: 18,

                        '&:hover': {
                          color: 'white',
                        },
                      },

                      '&:hover': {
                        background: '#5f08a8',
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Sender table */}
      <TableContainer
        sx={{
          maxHeight: 350,
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <Table
          stickyHeader
          sx={{
            tableLayout: 'fixed',
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }} />

              <TableCell sx={{ width: 'auto' }}>
                <strong>Sender</strong>
              </TableCell>

              <TableCell sx={{ width: 75 }}>
                <strong>Count</strong>
              </TableCell>

              <TableCell sx={{ width: 120 }}>
                <strong>Unsubscribe</strong>
              </TableCell>

              <TableCell sx={{ width: 75 }}>
                <strong>Block</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {senders.map(
              ({
                sender,
                senderEmail,
                count,
              }) => {
                const selected =
                  selectedSenders.includes(
                    senderEmail
                  );

                return (
                  <TableRow
                    key={
                      senderEmail || sender
                    }
                    hover
                    selected={selected}
                    sx={{
                      cursor: 'pointer',

                      '&.Mui-selected': {
                        backgroundColor:
                          'rgba(103, 58, 183, 0.08)',
                      },

                      '&.Mui-selected:hover': {
                        backgroundColor:
                          'rgba(103, 58, 183, 0.14)',
                      },
                    }}
                  >
                    {/* Checkbox */}
                    <TableCell>
                      <Checkbox
                        checked={selected}
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        onChange={() =>
                          onSenderToggle(
                            senderEmail
                          )
                        }
                      />
                    </TableCell>

                    {/* Sender */}
                    <TableCell
                      sx={{ width: 'auto' }}
                    >
                      <Typography
                        fontWeight={600}
                      >
                        {sender}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {senderEmail}
                      </Typography>
                    </TableCell>

                    {/* Count */}
                    <TableCell
                      sx={{ width: 60 }}
                      align="right"
                    >
                      <Chip
                        label={count}
                        size="small"
                        sx={{
                          background:
                            '#7209c9',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>

                    {/* Unsubscribe */}
                    <TableCell
                      sx={{ width: 60 }}
                    >
                      <Tooltip title="Find unsubscribe link">
                        <IconButton
                          size="small"
                          onClick={(event) =>
                            handleUnsubscribeClick(
                              event,
                              senderEmail
                            )
                          }
                          sx={{
                            color:
                              'success.main',
                          }}
                        >
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    {/* Block */}
                    <TableCell>
                      <Tooltip
                        title={`Block ${senderEmail}`}
                      >
                        <IconButton
                          color="error"
                          onClick={(event) => {
                            event.stopPropagation();

                            onBlockSender({
                              sender,
                              senderEmail,
                            });
                          }}
                        >
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Unsubscribe dialog */}
      <Dialog
        open={unsubscribeDialogOpen}
        onClose={
          handleCloseUnsubscribeDialog
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Unsubscribe
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {selectedSender}
          </Typography>

          {loadingUnsubscribe && (
            <Typography>
              Looking for an unsubscribe link...
            </Typography>
          )}

          {!loadingUnsubscribe &&
            unsubscribeLinks.length > 0 && (
              <>
                <Typography
                  color="warning.main"
                  fontWeight={600}
                  sx={{ mb: 2 }}
                >
                  ⚠️ Be careful when opening
                  unsubscribe links. Only continue
                  if you recognize the sender.
                </Typography>

                <Stack spacing={1}>
                  {unsubscribeLinks.map(
                    (link) => (
                      <Button
                        key={link}
                        component="a"
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        startIcon={
                          link.startsWith(
                            'mailto:'
                          ) ? (
                            <EmailIcon />
                          ) : (
                            <LinkIcon />
                          )
                        }
                        sx={{
                          justifyContent:
                            'flex-start',
                          textTransform:
                            'none',
                          wordBreak:
                            'break-all',
                        }}
                      >
                        {link}
                      </Button>
                    )
                  )}
                </Stack>
              </>
            )}

          {!loadingUnsubscribe &&
            unsubscribeLinks.length === 0 && (
              <Typography
                color="text.secondary"
              >
                No unsubscribe link was found
                for this sender.
              </Typography>
            )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCloseUnsubscribeDialog
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default SenderReport;

