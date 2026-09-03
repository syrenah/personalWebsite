import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Block as BlockIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import {
  CellStyleModule,
  ClientSideRowModelModule,
  ModuleRegistry,PaginationModule,
  RowSelectionModule,ColumnAutoSizeModule,
  
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowSelectionModule,
  CellStyleModule,ColumnAutoSizeModule,PaginationModule
]);

function SenderReport({
  senders,
  selectedSenders,
  onSenderToggle,
  onBlockSender,
  onBlockSelected,
  getUnsubscribeLinks, 
}) {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [unsubscribeDialogOpen, setUnsubscribeDialogOpen] =
    useState(false);

  const [selectedSender, setSelectedSender] = useState(null);

  const [unsubscribeLinks, setUnsubscribeLinks] = useState([]);

  const [loadingUnsubscribe, setLoadingUnsubscribe] =
    useState(false);

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [sendersToBlock, setSendersToBlock] = useState([]);



  const handleBlockSelected = () => {
    const selectedSenderDetails = selectedSenders.map((email) => {
      const senderInfo = senders.find((item) => item.senderEmail === email);
      return senderInfo
        ? { sender: senderInfo.sender, senderEmail: email }
        : null;
    }).filter(Boolean);

    if (selectedSenderDetails.length > 0) {
      setSendersToBlock(selectedSenderDetails);
      setBlockDialogOpen(true);
    }
  };

  const handleRemoveSenderToBlock = (senderEmail) => {
    setSendersToBlock((currentSenders) =>
      currentSenders.filter((sender) => sender.senderEmail !== senderEmail)
    );
    onSenderToggle(senderEmail);
  };

  const handleConfirmBlockSelected = () => {
    if (sendersToBlock.length === 0) {
      setBlockDialogOpen(false);
      return;
    }

    onBlockSelected(sendersToBlock);
    setBlockDialogOpen(false);
    setSendersToBlock([]);
  };

  const handleUnsubscribeClick = async (
    event,
    senderEmail
  ) => {
    event.stopPropagation();

    setSelectedSender(senderEmail);
    setUnsubscribeLinks([]);
    setUnsubscribeDialogOpen(true);
    setLoadingUnsubscribe(true);

    try {
      const links = await getUnsubscribeLinks(
        senderEmail
      );

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

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      suppressMenu: true,
      flex: 1,
      minWidth: 0,
      filter: false,
    }),
    []
  );

  const columnDefs = useMemo(
    () => [
      {
        field: 'select',
        headerName: '',
        minWidth: 37,
        maxWidth: 37,
        checkboxSelection: true,
        suppressMenu: true,
        sortable: false,
     
      },
      {
             field: 'sender',
             headerName: 'Sender',
             minWidth: 180,
             flex: 6,
             wrapText: true,
             autoHeight: true,
             cellStyle: { paddingTop: '6px', paddingBottom: '6px' },
             cellRenderer: (params) => (
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 0 }}>
                 <Typography sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                   {params.data.sender}
                 </Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                   {params.data.senderEmail}
                 </Typography>
               </Box>
             ),
           },
      {
        field: 'actions',
        headerName: '',
        minWidth: 72,
        maxWidth: 100,
        sortable: false,
        cellStyle: {
          padding: '1px',
        },
        cellRenderer: (params) => {
          const { sender, senderEmail, count } = params.data;
          return (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} alignItems="center" justifyContent="center" sx={{ width: '100%', py: 0 }}>
              <Chip
                label={count}
                size="small"
                sx={{ background: '#7209c9', color: 'white', fontWeight: 600 ,marginTop: 5 }}
              />

              <Tooltip title="Find unsubscribe link">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleUnsubscribeClick(event, senderEmail);
                  }}
                  sx={{ color: 'success.main' ,  padding: 0,
  width: 24,
  height: 35,
  minWidth: 24,
  minHeight: 35,}}
                >
                  <LinkIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={`Block ${senderEmail}`}>
                <IconButton    sx={{   padding: 0,
  width: 24,
  height: 35,
  minWidth: 24,
  minHeight: 35,}}
                  size="small"
                  color="error"
                  onClick={(event) => {
                    event.stopPropagation();
                    onBlockSender({ sender, senderEmail });
                  }}
                >
                  <BlockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [onBlockSender]
  );

  const rowData = useMemo(() => senders, [senders]);

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
          background: 'linear-gradient(90deg, #e3b3ff, #fdf4ff)',
        }}
      >
        <Stack direction="row" alignItems="center" gap={1} justifyContent="space-between" sx={{mb: 1}}>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="h6" fontWeight="bold">Senders</Typography>
            <Chip size="small" label={`${senders.length} senders`} sx={{ background: '#7209c9', color: 'white', fontWeight: 600 }} />
          </Stack>
          {selectedSenders.length > 0 && (
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<BlockIcon />}
              onClick={handleBlockSelected}
            >
              Block Selected ({selectedSenders.length})
            </Button>
          )}
        </Stack>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">

          {selectedSenders.length > 0 && (
            selectedSenders.map((email) => {
              const senderInfo = senders.find((item) => item.senderEmail === email);
              return (
                <Chip
                  key={email}
                  label={senderInfo?.sender || email}
                  size="small"
                  onDelete={() => onSenderToggle(email)}
                  sx={{
                    background: '#f3e8ff',
                    color: '#4c1d95',
                    border: '1px solid #d8b4fe',
                    fontWeight: 600,
                    height: 24,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.72rem',
                    },
                    '& .MuiChip-deleteIcon': {
                      color: '#6d28d9',
                      fontSize: 16,
                      '&:hover': { color: '#4c1d95' },
                    },
                  }}
                />
              );
            })
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Select senders to filter the email table.
        </Typography>
      </Box>

      <Divider />

      <Box
        className="ag-theme-alpine"
        sx={{
          width: '100%',
          height: 'calc(60vh - 20px)',
          minHeight: 250,
          '& .ag-root-wrapper': { borderRadius: 0 },
          '& .ag-header-row': { background: '#f8fafc' },
          '& .ag-header-cell': { fontWeight: 700 },
          '& .ag-cell': {
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
          },
          '& .ag-row-selected': {
            backgroundColor: '#f8fafc !important',
            color: '#0f172a',
          },
          '& .ag-row:not(.ag-row-selected)': { backgroundColor: '#ffffff !important' },
          '& .ag-row-selected:hover': {
            backgroundColor: '#f1f5f9 !important',
          },
        }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme="legacy"
          rowSelection="multiple"
          suppressRowClickSelection={false}
          rowMultiSelectWithClick={true}
          domLayout="normal"
          headerHeight={42}
          rowHeight={isXsScreen ? 120 : 40}
          suppressCellFocus={true}
          onRowSelected={(params) => {
            if (params.data) {
              onSenderToggle(params.data.senderEmail);
            }
          }}
          overlayNoRowsTemplate={'<span class="ag-overlay-no-rows-center">No senders found</span>'}
          pagination={true}
          paginationPageSize={25}
          paginationPageSizeSelector={[10, 25, 50, 100]}
        />
      </Box>

      <Dialog
        open={blockDialogOpen}
        onClose={() => setBlockDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Are you sure you want to block these senders?</DialogTitle>

        <DialogContent>
          <Stack spacing={1}>
            {sendersToBlock.map(({ sender, senderEmail }) => (
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
                  <Typography fontWeight={600} noWrap>
                    {sender}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                    {senderEmail}
                  </Typography>
                </Box>
                <IconButton
                  aria-label={`Remove ${senderEmail} from blocking`}
                  size="small"
                  onClick={() => handleRemoveSenderToBlock(senderEmail)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<BlockIcon />}
            onClick={handleConfirmBlockSelected}
            disabled={sendersToBlock.length === 0}
          >
            Block Selected
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={unsubscribeDialogOpen} onClose={handleCloseUnsubscribeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Unsubscribe</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedSender}
          </Typography>

          {loadingUnsubscribe && <Typography>Looking for an unsubscribe link...</Typography>}

          {!loadingUnsubscribe && unsubscribeLinks.length > 0 && (
            <>
              <Typography color="warning.main" fontWeight={600} sx={{ mb: 2 }}>
                ⚠️ Be careful when opening unsubscribe links. Only continue if you recognize the sender.
              </Typography>

              <Stack spacing={1}>
                {unsubscribeLinks.map((link) => (
                  <Button
                    key={link}
                    component="a"
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    startIcon={link.startsWith('mailto:') ? <EmailIcon /> : <LinkIcon />}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', wordBreak: 'break-all' }}
                  >
                    {link}
                  </Button>
                ))}
              </Stack>
            </>
          )}

          {!loadingUnsubscribe && unsubscribeLinks.length === 0 && (
            <Typography color="text.secondary">No unsubscribe link was found for this sender.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseUnsubscribeDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default SenderReport;

