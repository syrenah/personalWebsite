import React from 'react';
import {
  Box,
  Checkbox,
  Chip,
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
  return (
    <Paper
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(90deg, #eef2ff, #fdf4ff)',
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="h6" fontWeight="bold">
            Senders
          </Typography>
          <Chip
            size="small"
            label={`${senders.length} senders`}
            color="primary"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Select senders to filter the email table. We also inspect one email
          from each sender for an unsubscribe header.
        </Typography>
      </Box>

      <Divider />

      <TableContainer sx={{ maxHeight: 350 , width: '100%',
    overflowX: 'hidden', }}>
        <Table stickyHeader  sx={{
      tableLayout: 'fixed',
      width: '100%',
    }}   >
          <TableHead>
            <TableRow>
              <TableCell  sx={{ width: 60 }} />
              <TableCell sx={{ width: 'auto' }} ><strong>Sender</strong></TableCell>
              {/* <TableCell><strong>Email</strong></TableCell> */}
              <TableCell  sx={{ width: 75 }} ><strong>Count</strong></TableCell>
              <TableCell  sx={{ width: 120 }}><strong>Unsubscribe</strong></TableCell>
              <TableCell sx={{ width: 75 }} ><strong>Block</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {senders.map(({ sender, senderEmail, count }) => {
              const unsubscribeLinks = getUnsubscribeLinks(senderEmail);
              const selected = selectedSenders.includes(senderEmail);

              return (
                <TableRow
                  key={senderEmail || sender}
                  hover
                  selected={selected}
                  onClick={() => onSenderToggle(senderEmail)}
                  sx={{
                    cursor: 'pointer',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(103,58,183,.08)',
                    },
                  }}
                >
                  <TableCell  >
                    <Checkbox
                      checked={selected}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => onSenderToggle(senderEmail)}
                    />
                  </TableCell>

                  <TableCell  sx={{ width: 'auto' }}     >
                    <Typography fontWeight={600}>{sender}</Typography>

                     {senderEmail}

                  </TableCell>

                  {/* <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {senderEmail}
                    </Typography>
                  </TableCell> */}

                  <TableCell sx={{ width: 60 }}  align="right">
                    <Chip label={count} color="primary" size="small" />
                  </TableCell>

                  <TableCell sx={{ width: 60 }} >
                    {unsubscribeLinks.length > 0 ? (
                      <Stack direction="row" gap={0.5}>
                        {unsubscribeLinks.map((link) => (
                          <Tooltip key={link} title={link}>
                            <IconButton
                              size="small"
                              component="a"
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              sx={{ color: 'success.main' }}
                            >
                              {link.startsWith('mailto:') ? (
                                <EmailIcon />
                              ) : (
                                <LinkIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Stack>
                    ) : (
                      <Chip
                        size="small"
                        label="None found"
                        variant="outlined"
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <Tooltip title={`Block ${senderEmail}`}>
                      <IconButton
                        color="error"
                        onClick={(event) => {
                          event.stopPropagation();
                          onBlockSender({ sender, senderEmail });
                        }}
                      >
                        <BlockIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default SenderReport;
