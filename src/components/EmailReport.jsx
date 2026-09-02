import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import {
  CellStyleModule,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  ModuleRegistry,
  PaginationModule,
  RowAutoHeightModule,
  RowSelectionModule,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowSelectionModule,
  CellStyleModule,
  ColumnAutoSizeModule,
  PaginationModule,
  RowAutoHeightModule,
]);

import { formatDate } from '../utils/emailUtils';

function EmailReport({
  selectedEmails = [],
  emailsSelectedForDeletion = [],
  loading,
  onEmailClick,
  onToggleEmail,
  onToggleSelectAll,
  onDelete,
}) {
  const allVisibleSelected =
    selectedEmails.length > 0 &&
    selectedEmails.every((email) =>
      emailsSelectedForDeletion.includes(email.id)
    );

  const someVisibleSelected =
    selectedEmails.some((email) =>
      emailsSelectedForDeletion.includes(email.id)
    ) && !allVisibleSelected;

  const [gridApi, setGridApi] = useState(null);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      suppressMenu: true,
      flex: 1,
      minWidth: 0,
    }),
    []
  );

  const columnDefs = useMemo(
    () => [
      {
        field: 'select',
        headerName: '',
       
        minWidth: 37,
        maxWidth:  37,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        suppressMenu: true,
        sortable: false,
        filter: false,
        pinned: false,
        // cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
        headerClass: 'select-header',
      },
      {
        field: 'sender',
        headerName: 'Sender',
        minWidth: 100,
        flex: 2,
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
        field: 'subject',
        headerName: 'Subject',
        minWidth: 100,
        flex: 5,
        wrapText: true,
        autoHeight: true,
        cellStyle: { paddingTop: '6px', paddingBottom: '6px' },
        cellRenderer: (params) => (
          <Typography sx={{ width: '100%', fontWeight: 500, whiteSpace: 'normal', wordBreak: 'break-word' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'received',
        headerName: 'Date',
  
        minWidth: 88,
        maxWidth: 88,
        cellRenderer: (params) => {
          const value = params.value ? new Date(params.value) : null;

          if (!value || Number.isNaN(value.getTime())) {
            return <Typography variant="body2">—</Typography>;
          }

          const date = value.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
          });

          const time = value.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          });

          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1.2,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" >
                {date}
              </Typography>
              <Typography variant="caption" color="text.secondary" >
                {time}
              </Typography>
            </Box>
          );
        },
      },
      // {
      //   field: 'status',
      //   headerName: 'Status',
      //   width: 80,
      //   minWidth: 80,
      //   maxWidth: 80,
      //   cellRenderer: (params) => (
      //     <Chip
      //       size="small"
      //       label={params.value}
      //       color={params.value === 'Read' ? 'success' : 'warning'}
      //       variant="outlined"
      //     />
      //   ),
      // },
    ],
    [emailsSelectedForDeletion, onToggleEmail]
  );

  const rowData = useMemo(() => selectedEmails, [selectedEmails]);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const syncSelectionState = (params) => {
    const gridSelectedIds = new Set(
      params.api.getSelectedRows().map((row) => row.id)
    );
    const currentSelectedIds = new Set(emailsSelectedForDeletion);

    const addedIds = [...gridSelectedIds].filter(
      (id) => !currentSelectedIds.has(id)
    );

    const removedIds = [...currentSelectedIds].filter(
      (id) => !gridSelectedIds.has(id) && selectedEmails.some((email) => email.id === id)
    );

    addedIds.forEach((id) => onToggleEmail(id));
    removedIds.forEach((id) => onToggleEmail(id));
  };

  const onFirstDataRendered = (params) => {
    params.api.sizeColumnsToFit();
  };

  const onGridSizeChanged = (params) => {
    if (gridApi) {
      params.api.sizeColumnsToFit();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Toolbar
        sx={{
          background: 'linear-gradient(90deg, #e3b3ff, #fdf4ff)',
          borderBottom: '1px solid #e5e7eb',
          px: { xs: 2, sm: 3 },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          width="100%"
          gap={2}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              disabled={emailsSelectedForDeletion.length === 0}
              onClick={onDelete}
            >
              View & Delete
            </Button>

            {emailsSelectedForDeletion.length > 0 && (
              <Chip
                color="error"
                label={`${emailsSelectedForDeletion.length} selected`}
              />
            )}
          </Stack>
        </Stack>
      </Toolbar>

      <Box
        className="ag-theme-alpine"
        sx={{
          width: '100%',
          height: 'calc(95vh - 120px)',
          minHeight: 300,
          '& .ag-root-wrapper': { borderRadius: 0 },
          '& .ag-header-row': { background: '#f8fafc' },
          '& .ag-header-cell': { fontWeight: 700 },
          '& .ag-cell': {
            display: 'block',
            alignItems: 'flex-start',
            whiteSpace: 'normal',
            lineHeight: 1.4,
            overflow: 'visible',
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
          suppressRowClickSelection={true}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          onGridSizeChanged={onGridSizeChanged}
          rowMultiSelectWithClick={false}
          domLayout="normal"
          headerHeight={42}
          rowAutoHeight={true}
          getRowHeight={(params) => {
            const subject = params.data?.subject || '';
            const sender = params.data?.sender || '';
            const senderEmail = params.data?.senderEmail || '';
            const totalLength = `${subject} ${sender} ${senderEmail}`.length;
            const estimatedLines = Math.max(2, Math.ceil(totalLength / 36));
            return Math.max(64, estimatedLines * 18);
          }}
          suppressCellFocus={true}
          pagination={true}
          paginationPageSize={25}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          overlayNoRowsTemplate={
            loading
              ? '<span class="ag-overlay-no-rows-center">Loading...</span>'
              : '<span class="ag-overlay-no-rows-center">Select A Sender</span>'
          }
          onSelectionChanged={syncSelectionState}
          onCellClicked={(params) => {
            if (params.column.getColId() === 'select') {
              return;
            }

            onEmailClick(params.data);
          }}
        />
      </Box>


    </Paper>
  );
}

export default EmailReport;