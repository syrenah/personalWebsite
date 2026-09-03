import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Block as BlockIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  PaginationModule,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { formatDate, getSpamLikelihood } from '../utils/emailUtils';

ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule]);

function SuspiciousityDrawer({
  emails = [],
  onReportSenders,
  onDeleteEmails,
  onEmailClick,
}) {
  const [open, setOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [sendersToReport, setSendersToReport] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [expandedSenders, setExpandedSenders] = useState(new Set());
  const [selectedSenders, setSelectedSenders] = useState(new Set());

  useEffect(() => {
    console.log('sendersToReport changed:', sendersToReport);
  }, [sendersToReport]);

  useEffect(() => {
    console.log('selectedSenders changed:', [...selectedSenders]);
  }, [selectedSenders]);

  const suspiciousGroups = useMemo(() => {
    const groups = new Map();

    emails.forEach((email) => {
      const likelihood = getSpamLikelihood(email);

      if (!likelihood.isLikelySpam) {
        return;
      }

      const senderEmail = email.senderEmail || 'unknown';
      const group = groups.get(senderEmail) || {
        sender: email.sender || 'Unknown',
        senderEmail,
        score: 0,
        reasons: new Set(),
        emails: [],
      };

      group.score = Math.max(group.score, likelihood.score);
      likelihood.reasons.forEach((reason) => group.reasons.add(reason));
      group.emails.push({ ...email, spamScore: likelihood.score });
      groups.set(senderEmail, group);
    });

    return [...groups.values()]
      .map((group) => ({ ...group, reasons: [...group.reasons] }))
      .sort((first, second) => second.score - first.score);
  }, [emails]);

  const rowData = useMemo(
    () => suspiciousGroups.flatMap((group) => {
      const groupRow = {
        rowId: `group-${group.senderEmail}`,
        rowType: 'group',
        ...group,
      };

      if (!expandedSenders.has(group.senderEmail)) {
        return [groupRow];
      }

      return [
        groupRow,
        ...group.emails.map((email) => ({
          ...email,
          rowId: `email-${email.id}`,
          rowType: 'email',
        })),
      ];
    }),
    [expandedSenders, suspiciousGroups]
  );

  const selectedGroups = suspiciousGroups.filter((group) =>
    selectedSenders.has(group.senderEmail)
  );

  const toggleExpanded = (senderEmail) => {
    setExpandedSenders((current) => {
      const next = new Set(current);
      if (next.has(senderEmail)) {
        next.delete(senderEmail);
      } else {
        next.add(senderEmail);
      }
      return next;
    });
  };

  const handleReport = () => {
    setSendersToReport(
      selectedGroups.map(({ sender, senderEmail, score, emails }) => ({
        sender,
        senderEmail,
        score,
        emailCount: emails.length,
      }))
    );
    setReportDialogOpen(true);
  };

  const handleRemoveSenderToReport = (senderEmail) => {
    setSendersToReport((current) =>
      current.filter((sender) => sender.senderEmail !== senderEmail)
    );
    setSelectedSenders((current) => {
      const next = new Set(current);
      next.delete(senderEmail);
      return next;
    });
    gridApi?.getRowNode(`group-${senderEmail}`)?.setSelected(false);
  };

  const handleConfirmReport = () => {
    onReportSenders(
      sendersToReport.map(({ sender, senderEmail }) => ({ sender, senderEmail }))
    );
    setReportDialogOpen(false);
    setSendersToReport([]);
    setSelectedSenders(new Set());
  };

  const handleDelete = () => {
    onDeleteEmails(selectedGroups.flatMap((group) => group.emails.map((email) => email.id)));
    setSelectedSenders(new Set());
  };

  const columnDefs = useMemo(() => [
    {
      field: 'sender',
      headerName: 'Sender / Email',
      flex: 5,
      minWidth: 180,
      cellRenderer: (params) => {
        if (params.data.rowType === 'email') {
          return (
            <Box sx={{ pl: 3, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={500} noWrap>
                {params.data.sender}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {params.data.senderEmail}
              </Typography>
            </Box>
          );
        }

        const isExpanded = expandedSenders.has(params.data.senderEmail);
        return (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
            <IconButton
              size="small"
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${params.data.senderEmail}`}
              onClick={() => toggleExpanded(params.data.senderEmail)}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={600} noWrap>{params.data.sender}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {params.data.senderEmail}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 5,
      minWidth: 180,
      cellRenderer: (params) => params.data.rowType === 'email' ? (
        <Typography sx={{ width: '100%', fontWeight: 500, whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {params.value}
        </Typography>
      ) : null,
    },
    {
      field: 'received',
      headerName: 'Date',
      minWidth: 100,
      maxWidth: 110,
      cellRenderer: (params) => params.data.rowType === 'email' ? (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.value)}
        </Typography>
      ) : null,
    },
    {
      field: 'score',
      headerName: 'Score',
      width: 85,
      sortable: true,
      cellRenderer: (params) => params.data.rowType === 'group'
        ? <Chip size="small" color="error" label={params.value} />
        : <Typography variant="caption">{params.data.spamScore}</Typography>,
    },
    {
      field: 'select',
      headerName: '',
      width: 52,
      checkboxSelection: (params) => params.data.rowType === 'group',
      sortable: false,
    },
  ], [expandedSenders]);

  const handleGridCellClicked = (params) => {
    if (params.data?.rowType === 'email') {
      onEmailClick(params.data);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="warning"
        startIcon={<WarningIcon />}
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: '8px 8px 0 0',
        }}
      >
        Suspiciousity {suspiciousGroups.length > 0 && `(${suspiciousGroups.length})`}
      </Button>

      <Drawer anchor="bottom" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            p: { xs: 1.5, sm: 3 },
            height: '70vh',
            minHeight: 360,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 2, flexShrink: 0 }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">Suspiciousity report</Typography>
              <Typography variant="body2" color="text.secondary">
                Select sender groups to report or move all their emails to Deleted Items.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                color="error"
                variant="contained"
                startIcon={<BlockIcon />}
                disabled={selectedGroups.length === 0}
                onClick={handleReport}
              >
                Report senders
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<DeleteIcon />}
                disabled={selectedGroups.length === 0}
                onClick={handleDelete}
              >
                Delete emails
              </Button>
            </Stack>
          </Stack>

          <Box
            className="ag-theme-alpine"
            sx={{
              flex: 1,
              width: '100%',
              minHeight: 0,
              '& .ag-root-wrapper': { borderRadius: 0 },
              '& .ag-header-row': { background: '#f8fafc' },
              '& .ag-header-cell': { fontWeight: 700 },
              '& .ag-cell': {
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                whiteSpace: 'normal',
              },
              '& .ag-row': { cursor: 'pointer' },
              '& .ag-row-selected': {
                backgroundColor: '#f8fafc !important',
                color: '#0f172a',
              },
            }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{ resizable: true, suppressMenu: true }}
              getRowId={(params) => params.data.rowId}
              getRowHeight={(params) => params.data.rowType === 'group' ? 58 : 56}
              rowSelection="multiple"
              suppressRowClickSelection
              isRowSelectable={(params) => params.data.rowType === 'group'}
              onGridReady={(params) => setGridApi(params.api)}
              onSelectionChanged={(params) => {
                setSelectedSenders(
                  new Set(
                    params.api
                      .getSelectedRows()
                      .map((row) => row.senderEmail)
                  )
                );
              }}
              onCellClicked={handleGridCellClicked}
              pagination
              paginationPageSize={25}
              overlayNoRowsTemplate="<span class='ag-overlay-no-rows-center'>No suspicious senders found</span>"
            />
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report selected senders?</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to report these senders as junk?
          </Typography>

          <Stack spacing={1}>
            {sendersToReport.map(({ sender, senderEmail, score, emailCount }) => (
              <Paper
                key={senderEmail}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={600} noWrap>{sender}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                    {senderEmail}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Score {score} · {emailCount} email{emailCount === 1 ? '' : 's'}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  aria-label={`Remove ${senderEmail} from report`}
                  onClick={() => handleRemoveSenderToReport(senderEmail)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<BlockIcon />}
            onClick={handleConfirmReport}
            disabled={sendersToReport.length === 0}
          >
            Report senders
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SuspiciousityDrawer;