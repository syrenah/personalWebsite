import React, { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  PublicClientApplication,
} from '@azure/msal-browser';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Paper,
} from '@mui/material';

// =====================================================
// Microsoft configuration
// =====================================================

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: 'eb418d25-b842-4377-bf39-c218b6459f51',

    authority:
      'https://login.microsoftonline.com/common',

    redirectUri: window.location.origin,
  },

  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
});


// =====================================================
// Component
// =====================================================

function OutlookPortal() {

  const [account, setAccount] = useState(null);
  const [emails, setEmails] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const [selectedSenders, setSelectedSenders] = useState([]);
const [selectedEmail, setSelectedEmail] = useState(null);
const [emailLoading, setEmailLoading] = useState(false);


const sanitizedBody = useMemo(() => {
  if (!selectedEmail?.body) {
    return '';
  }

  return DOMPurify.sanitize(selectedEmail.body, {
    USE_PROFILES: {
      html: true,
    },

    FORBID_TAGS: [
      'script',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'button',
      'textarea',
      'select',
      'meta',
      'link',
    ],

    FORBID_ATTR: [
      'onerror',
      'onload',
      'onclick',
      'onmouseover',
      'onfocus',
      'onmouseenter',
      'onmouseleave',
    ],
  });
}, [selectedEmail?.body]);

const senderData = React.useMemo(() => {
  const counts = {};

  emails.forEach(email => {
    const sender = email.sender || 'Unknown';

    counts[sender] = (counts[sender] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([sender, count]) => ({
      sender,
      count,
    }))
    .sort((a, b) => b.count - a.count);

}, [emails]);
  // ===================================================
  // Table columns
  // ===================================================
const handleEmailClick = async (event) => {
  const email = event.data;

  // Open dialog immediately
  setSelectedEmail({
    ...email,
    body: '',
  });

  setEmailLoading(true);

  try {
    const accessToken = await getAccessToken(account);

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${email.id}?$select=subject,sender,toRecipients,receivedDateTime,body`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Prefer: 'outlook.body-content-type="html"',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unable to load email (${response.status})`);
    }

    const data = await response.json();

    setSelectedEmail({
      ...email,
      body: data.body?.content || '',
    });

  } catch (err) {
    console.error(err);
    setSelectedEmail(null);
    setError(err.message);

  } finally {
    setEmailLoading(false);
  }
};
 const columns = React.useMemo(
  () => [
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
    },
    {
      accessorKey: 'received',
      header: 'Received',
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'attachment',
      header: 'Attachment',
    },
  ],
  []
);


  // ===================================================
  // Initialize MSAL
  // ===================================================

  useEffect(() => {

    const initialize = async () => {

      try {

        await msalInstance.initialize();

        const response =
          await msalInstance.handleRedirectPromise();

        if (response?.account) {

          setAccount(response.account);

          await loadEmails(response.account);

          return;
        }

        const accounts =
          msalInstance.getAllAccounts();

        if (accounts.length > 0) {

          setAccount(accounts[0]);

          await loadEmails(accounts[0]);
        }

      } catch (err) {

        console.error(err);

        setError(err.message);
      }
    };

    initialize();

  }, []);


  // ===================================================
  // Login
  // ===================================================

  const login = async () => {

    try {

      setError(null);

      await msalInstance.loginRedirect({
        scopes: [
          'User.Read',
          'Mail.Read',
        ],
      });

    } catch (err) {

      console.error(err);

      setError(err.message);
    }
  };
const filteredEmails = React.useMemo(() => {
  if (selectedSenders.length === 0) {
    return emails;
  }

  return emails.filter(email =>
    selectedSenders.includes(email.sender)
  );
}, [emails, selectedSenders]);






const senders = React.useMemo(() => {
  return [...new Set(emails.map(email => email.sender))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}, [emails]);
  // ===================================================
  // Logout
  // ===================================================

  const logout = async () => {

    await msalInstance.logoutRedirect();
  };

const table = useReactTable({
  data: filteredEmails,
  columns,

  getCoreRowModel: getCoreRowModel(),

  getFilteredRowModel: getFilteredRowModel(),

  getSortedRowModel: getSortedRowModel(),

  getPaginationRowModel: getPaginationRowModel(),

  initialState: {
    pagination: {
      pageSize: 25,
    },
  },
});
  // ===================================================
  // Get access token
  // ===================================================

  const getAccessToken = async (user) => {

    const request = {
      scopes: [
        'User.Read',
        'Mail.Read',
      ],
      account: user,
    };

    try {

      const response =
        await msalInstance.acquireTokenSilent(
          request
        );

      return response.accessToken;

    } catch (error) {

      console.log(
        'Silent token acquisition failed. Redirecting...'
      );

      await msalInstance.acquireTokenRedirect(
        request
      );
    }
  };


  // ===================================================
  // Load emails
  // ===================================================
const loadEmails = async (user) => {
  setLoading(true);
  setError(null);

  try {
    const accessToken = await getAccessToken(user);

    let url =
      'https://graph.microsoft.com/v1.0/me/messages' +
      '?$select=id,sender,subject,receivedDateTime,isRead,hasAttachments' +
      '&$top=1000' +
      '&$orderby=receivedDateTime DESC';

    const allEmails = [];

    while (url) {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Microsoft Graph error ${response.status}`
        );
      }

      const data = await response.json();

      allEmails.push(...data.value);

      // Graph gives us the next URL
      url = data['@odata.nextLink'] || null;
    }

    const formatted = allEmails.map(email => ({
      id: email.id,

      sender:
        email.sender?.emailAddress?.name ||
        'Unknown',

      senderEmail:
        email.sender?.emailAddress?.address ||
        '',

      subject:
        email.subject ||
        '(No subject)',

      received:
        new Date(
          email.receivedDateTime
        ).toLocaleString(),

      status:
        email.isRead
          ? 'Read'
          : 'Unread',

      attachment:
        email.hasAttachments
          ? 'Yes'
          : 'No',
    }));

    setEmails(formatted);

  } catch (err) {
    console.error(err);
    setError(err.message);

  } finally {
    setLoading(false);
  }
};

  const refresh = async () => {

    if (account) {

      await loadEmails(account);
    }
  };


  // ===================================================
  // Not logged in
  // ===================================================

  if (!account) {

    return (

      <div
        style={{
          padding: '40px',
          textAlign: 'center',
        }}
      >

        <h2>
          Outlook Email Portal
        </h2>

        <p>
          Sign in with Microsoft to view your emails.
        </p>


        {error && (

          <p
            style={{
              color: 'red',
            }}
          >
            {error}
          </p>

        )}


        <button
          onClick={login}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Sign in with Microsoft
        </button>

      </div>

    );
  }


  // ===================================================
  // Logged in
  // ===================================================

  return (

    <div
      style={{
        width: '100%',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >

        <div>





<TableContainer
  component={Paper}
  sx={{
    maxHeight: 300,
    mb: 3,
  }}
>
  <Table stickyHeader size="small">

    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          Select
        </TableCell>

        <TableCell>
          Sender
        </TableCell>

        <TableCell align="right">
          Emails
        </TableCell>
      </TableRow>
    </TableHead>

    <TableBody>

      {senderData.map(({ sender, count }) => (

        <TableRow
          key={sender}
          hover
          onClick={() => {

            setSelectedSenders(current => {

              if (current.includes(sender)) {
                return current.filter(
                  value => value !== sender
                );
              }

              return [...current, sender];
            });

          }}
          sx={{
            cursor: 'pointer',
          }}
        >

          <TableCell padding="checkbox">

            <Checkbox
              checked={selectedSenders.includes(sender)}
              onClick={(event) => {
                event.stopPropagation();
              }}
              onChange={() => {

                setSelectedSenders(current => {

                  if (current.includes(sender)) {
                    return current.filter(
                      value => value !== sender
                    );
                  }

                  return [...current, sender];
                });

              }}
            />

          </TableCell>

          <TableCell>
            {sender}
          </TableCell>

          <TableCell align="right">
            {count}
          </TableCell>

        </TableRow>

      ))}

    </TableBody>

  </Table>
</TableContainer>




          <h2>
            Outlook Email Portal
          </h2>

          <div>
            {account.name || account.username}
          </div>

        </div>


        <div
          style={{
            display: 'flex',
            gap: '10px',
          }}
        >

          <button
            onClick={refresh}
            disabled={loading}
          >
            {loading
              ? 'Loading...'
              : 'Refresh'}
          </button>


          <button
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>


      {error && (

        <div
          style={{
            color: 'red',
            marginBottom: '15px',
          }}
        >
          {error}
        </div>

      )}


      <div
        className="ag-theme-quartz"
        style={{
          width: '100%',
          height: '650px',
        }}
      >

      <Paper>

  <TableContainer>

    <Table>

      <TableHead>

        {table.getHeaderGroups().map(headerGroup => (

          <TableRow key={headerGroup.id}>

            {headerGroup.headers.map(header => (

              <TableCell
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
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
                    : ''
                }

              </TableCell>

            ))}

          </TableRow>

        ))}

      </TableHead>


      <TableBody>

        {table.getRowModel().rows.map(row => (

          <TableRow
            key={row.id}
            hover
            onClick={() => handleEmailClick({
              data: row.original
            })}
            sx={{
              cursor: 'pointer',
            }}
          >

            {row.getVisibleCells().map(cell => (

              <TableCell key={cell.id}>

                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )}

              </TableCell>

            ))}

          </TableRow>

        ))}

      </TableBody>

    </Table>

  </TableContainer>


  <TablePagination
    component="div"

    count={filteredEmails.length}

    page={table.getState().pagination.pageIndex}

    onPageChange={(event, newPage) => {
      table.setPageIndex(newPage);
    }}

    rowsPerPage={
      table.getState().pagination.pageSize
    }

    onRowsPerPageChange={(event) => {

      table.setPageSize(
        Number(event.target.value)
      );

    }}

    rowsPerPageOptions={[
      10,
      25,
      50,
      100,
    ]}
  />

</Paper>

      </div>
<Dialog
  open={Boolean(selectedEmail)}
  onClose={() => setSelectedEmail(null)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        {selectedEmail?.subject}
      </div>

      <IconButton
        onClick={() => setSelectedEmail(null)}
      >
        <CloseIcon />
      </IconButton>
    </div>
  </DialogTitle>

  <DialogContent>

    {emailLoading ? (
      <p>Loading email...</p>
    ) : (
      <>
        <div style={{ marginBottom: '20px' }}>
          <strong>From:</strong>{' '}
          {selectedEmail?.sender}

          <br />

          <strong>Email:</strong>{' '}
          {selectedEmail?.senderEmail}

          <br />

          <strong>Received:</strong>{' '}
          {selectedEmail?.received}
        </div>

        <hr />

        <div
          style={{
            marginTop: '20px',
            lineHeight: 1.5,
          }}
    
              ///dompurify santized
              dangerouslySetInnerHTML={{
                __html: sanitizedBody,
              }}

        />
      </>
    )}

  </DialogContent>
</Dialog>
    </div>
  );
}

export default OutlookPortal;