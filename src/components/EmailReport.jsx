import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon, Email as EmailIcon } from '@mui/icons-material';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { formatDate } from '../utils/emailUtils';

function EmailReport({
  emails,
  selectedSenders,
  selectedEmails,
  loading,
  onEmailClick,
  onToggleEmail,
  onToggleSelectAll,
  onDelete,
}) {
  const allVisibleSelected =
    emails.length > 0 &&
    emails.every((email) => selectedEmails.includes(email.id));

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={selectedEmails.length > 0 && !allVisibleSelected}
            onChange={onToggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedEmails.includes(row.original.id)}
            onChange={() => onToggleEmail(row.original.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'sender',
        header: 'Sender',
      },
      {
        accessorKey: 'senderEmail',
        header: 'Email',
      },
      {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ getValue }) => (
          <Typography noWrap sx={{ maxWidth: 350, fontWeight: 500 }}>
            {getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'received',
        header: 'Received',
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <Chip
            size="small"
            label={getValue()}
            color={getValue() === 'Read' ? 'success' : 'warning'}
            variant="outlined"
          />
        ),
      },
      {
        accessorKey: 'attachment',
        header: 'Attachment',
        cell: ({ getValue }) => (
          <Chip
            size="small"
            label={getValue() === 'Yes' ? 'Yes' : 'No'}
            color={getValue() === 'Yes' ? 'secondary' : 'default'}
          />
        ),
      },
      {
        id: 'delete',
        header: 'Delete',
        cell: ({ row }) => (
          <Checkbox
            checked={selectedEmails.includes(row.original.id)}
            onChange={() => onToggleEmail(row.original.id)}
            onClick={(event) => event.stopPropagation()}
            icon={<DeleteIcon sx={{ opacity: 0.35 }} />}
            checkedIcon={<DeleteIcon color="error" />}
          />
        ),
        enableSorting: false,
      },
    ],
    [allVisibleSelected, selectedEmails, onToggleEmail, onToggleSelectAll]
  );

  const table = useReactTable({
    data: emails,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  return (
    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Toolbar
        sx={{

             background: 'linear-gradient(90deg, #e3b3ff, #fdf4ff)',
          // background:
          //   selectedEmails.length > 0
          //     ? 'linear-gradient(90deg, #fff1f2, #fff7ed)'
          //     : 'linear-gradient(90deg, #f0f9ff, #eef2ff)',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          gap={2}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Emails
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedSenders.length > 0
                ? `Showing emails from ${selectedSenders.length} selected sender${selectedSenders.length === 1 ? '' : 's'}`
                : 'Showing all senders'}
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" gap={1}>
            {selectedEmails.length > 0 && (
              <Chip
                color="error"
                label={`${selectedEmails.length} selected`}
              />
            )}

            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              disabled={selectedEmails.length === 0}
              onClick={onDelete}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Toolbar>

      {loading && <LinearProgress />}

      <TableContainer sx={{ maxHeight: 650 }}>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    sx={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      fontWeight: 'bold',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === 'asc'
                      ? ' ▲'
                      : header.column.getIsSorted() === 'desc'
                        ? ' ▼'
                        : ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onEmailClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {!loading && emails.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <EmailIcon
                      sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No emails found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select a report timeframe and load your emails.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={emails.length}
        page={table.getState().pagination.pageIndex}
        onPageChange={(event, newPage) => table.setPageIndex(newPage)}
        rowsPerPage={table.getState().pagination.pageSize}
        onRowsPerPageChange={(event) =>
          table.setPageSize(Number(event.target.value))
        }
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Paper>
  );
}

export default EmailReport;
