import React, { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { PublicClientApplication } from '@azure/msal-browser';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { Email as EmailIcon, Security as SecurityIcon } from '@mui/icons-material';

import OutlookHeader from './components/OutlookHeader';
import ReportTimeframe from './components/ReportTimeframe';
import SenderReport from './components/SenderReport';
import EmailReport from './components/EmailReport';
import BlockSenderDialog from './components/BlockSenderDialog';
import DeleteEmailsDialog from './components/DeleteEmailsDialog';
import EmailDialog from './components/EmailDialog';
import JobPane from './components/JobPane';

import {
  getMessageBody,
  getMessageHeaders,
  getMessages,
  moveMessageToDeletedItems,
  reportMessageAsJunk,
} from './services/microsoftGraph';
import {
  extractUnsubscribeLinks,
  getDateRangeForDays,
} from './utils/emailUtils';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: 'eb418d25-b842-4377-bf39-c218b6459f51',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
});

function OutlookReport() {
  const [account, setAccount] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSenders, setSelectedSenders] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [senderToBlock, setSenderToBlock] = useState(null);
  const [blocking, setBlocking] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [timeframe, setTimeframe] = useState(7);

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

const [jobs, setJobs] = useState([]);


  useEffect(() => {
    const initialize = async () => {
      try {
        await msalInstance.initialize();

        const response = await msalInstance.handleRedirectPromise();

        if (response?.account) {
          setAccount(response.account);
          return;
        }

        const accounts = msalInstance.getAllAccounts();

        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    initialize();
  }, []);

  const login = async () => {
    try {
      setError(null);

      await msalInstance.loginRedirect({
        scopes: ['User.Read', 'Mail.ReadWrite'],
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const logout = async () => {
    await msalInstance.logoutRedirect();
  };

  const getAccessToken = async (user) => {
    const request = {
      scopes: ['User.Read', 'Mail.ReadWrite'],
      account: user,
    };

    try {
      const response = await msalInstance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (tokenError) {
      console.log('Silent token acquisition failed.');

      await msalInstance.acquireTokenRedirect(request);
      return null;
    }
  };

  const loadEmails = async (user = account, selectedTimeframe = timeframe) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken(user);

      if (!accessToken) {
        return;
      }

      const { start, end } = getDateRangeForDays(selectedTimeframe);
      const formatted = await getMessages(accessToken, start, end);

      setEmails(formatted);
      setSelectedEmails([]);
      setSelectedSenders([]);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadEmails(account, timeframe);
    }
    // Intentionally load the default report once authentication completes.
    // Timeframe changes are handled by handleTimeframeChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const handleTimeframeChange = (days) => {
    setTimeframe(days);

    if (account) {
      loadEmails(account, days);
    }
  };

  const senderData = useMemo(() => {
    const groups = {};

    emails.forEach((email) => {
      const key = email.senderEmail || email.sender || 'Unknown';

      if (!groups[key]) {
        groups[key] = {
          sender: email.sender || 'Unknown',
          senderEmail: email.senderEmail || '',
          count: 0,
        };
      }

      groups[key].count += 1;
    });

    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [emails]);

  const filteredEmails = useMemo(() => {
    if (selectedSenders.length === 0) {
      return emails;
    }

    return emails.filter((email) =>
      selectedSenders.includes(email.senderEmail)
    );
  }, [emails, selectedSenders]);



 const findUnsubscribeLinks = async () => {
      // try {
        const accessToken = await getAccessToken(account);

        // if (!accessToken) {
        //   return;
        // }

        // const updatedEmails = [...emails];

        // for (const sender of senderData) {
        //   const matchingEmail = updatedEmails.find(
        //     (email) => email.senderEmail === sender.senderEmail
        //   );

        //   if (!matchingEmail) {
        //     continue;
        //   }

        //   try {
        //     const data = await getMessageHeaders(
        //       accessToken,
        //       matchingEmail.id
        //     );

        //     if (!data) {
        //       continue;
        //     }

        //     const links = extractUnsubscribeLinks(
        //       data.internetMessageHeaders
        //     );

        //     if (links.length > 0) {
        //       setEmails((current) =>
        //         current.map((email) => {
        //           if (email.senderEmail !== sender.senderEmail) {
        //             return email;
        //           }

        //           return {
        //             ...email,
        //             unsubscribeLinks: links,
        //           };
        //         })
        //       );
        //     }
      //     } catch (err) {
      //       console.error(
      //         'Unable to inspect unsubscribe header:',
      //         err
      //       );
      //     }
      //   }
      // } catch (err) {
      //   console.error(err);
      // }
    };

  // useEffect(() => {
  //   if (!account || !senderData.length) {
  //     return;
  //   }


  //   findUnsubscribeLinks();
  //   // Intentionally only runs when the sender collection changes.
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [account]);



  // const getSenderUnsubscribeLinks = (senderEmail) => {
  //   const email = emails.find(
  //     (item) =>
  //       item.senderEmail === senderEmail &&
  //       item.unsubscribeLinks?.length
  //   );

  //   return email?.unsubscribeLinks || [];
  // };

  const handleEmailClick = async (email) => {
    setSelectedEmail({
      ...email,
      body: '',
    });

    setEmailLoading(true);

    try {
      const accessToken = await getAccessToken(account);

      if (!accessToken) {
        return;
      }

      const data = await getMessageBody(accessToken, email.id);
      const unsubscribeLinks = extractUnsubscribeLinks(
        data.internetMessageHeaders
      );

      setSelectedEmail({
        ...email,
        body: data.body?.content || '',
        unsubscribeLinks,
        unsubscribeEnabled: data.unsubscribeEnabled,
        unsubscribeData: data.unsubscribeData,
      });
    } catch (err) {
      console.error(err);
      setSelectedEmail(null);
      setError(err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const blockSender = async () => {
    if (!senderToBlock) {
      return;
    }

    setBlocking(true);
    setError(null);

    try {
      const accessToken = await getAccessToken(account);

      if (!accessToken) {
        return;
      }

      const senderMessage = emails.find(
        (email) => email.senderEmail === senderToBlock.senderEmail
      );

      if (!senderMessage) {
        throw new Error('Could not find an email from this sender.');
      }

      await reportMessageAsJunk(accessToken, senderMessage.id);

      setEmails((current) =>
        current.filter(
          (email) => email.senderEmail !== senderToBlock.senderEmail
        )
      );

      setSelectedEmails([]);
      setSenderToBlock(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBlocking(false);
    }
  };

  const toggleEmailSelection = (emailId) => {
    setSelectedEmails((current) => {
      if (current.includes(emailId)) {
        return current.filter((id) => id !== emailId);
      }

      return [...current, emailId];
    });
  };

  const toggleSelectAll = () => {
    const allVisibleSelected =
      filteredEmails.length > 0 &&
      filteredEmails.every((email) => selectedEmails.includes(email.id));

    if (allVisibleSelected) {
      setSelectedEmails((current) =>
        current.filter(
          (id) => !filteredEmails.some((email) => email.id === id)
        )
      );
      return;
    }

    setSelectedEmails((current) => [
      ...new Set([
        ...current,
        ...filteredEmails.map((email) => email.id),
      ]),
    ]);
  };

  const toggleSender = (senderEmail) => {
    setSelectedSenders((current) => {
      if (current.includes(senderEmail)) {
        return current.filter((value) => value !== senderEmail);
      }

      return [...current, senderEmail];
    });
  };

 const deleteSelectedEmails = async () => {
  if (selectedEmails.length === 0) {
    return;
  }

  setDeleting(true);
  setError(null);

  try {
    const accessToken = await getAccessToken(account);

    if (!accessToken) {
      throw new Error('Unable to obtain access token');
    }

    await createDeleteJob(selectedEmails, accessToken);

    setSelectedEmails([]);
    setDeleteDialogOpen(false);
  } catch (err) {
    console.error('Delete failed:', err);
    setError(err.message);
  } finally {
    setDeleting(false);
  }
};


const createDeleteJob = async (emailIds, accessToken) => {
  const jobId = crypto.randomUUID();

  const job = {
    id: jobId,
    type: 'delete',
    name: `Moving ${emailIds.length} emails`,
    total: emailIds.length,
    completed: 0,
    failed: 0,
    status: 'running',
  };

  setJobs((current) => [
    ...current,
    job,
  ]);


  await runDeleteJob(
    jobId,
    emailIds,
    accessToken
  );
};

const runDeleteJob = async (
  jobId,
  emailIds,
  accessToken
) => {
  let completed = 0;
  let failed = 0;

  const updateJob = () => {
    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              completed,
              failed,
            }
          : job
      )
    );
  };

  await Promise.all(
    emailIds.map(async (emailId) => {

      try {
        await moveMessageToDeletedItems(
          accessToken,
          emailId
        );

        completed++;
      } catch (error) {
    
        failed++;
      }

      updateJob();
    })
  );

  setJobs((current) =>
    current.map((job) =>
      job.id === jobId
        ? {
            ...job,
            completed,
            failed,
            status:
              failed > 0
                ? 'complete-with-errors'
                : 'complete',
          }
        : job
    )
  );
};


// return

  if (!account) {
    return (
      <Box
      sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
        }}
      >
        <Paper
          elevation={12}
          sx={{
            maxWidth: 500,
            width: '100%',
            p: 5,
            textAlign: 'center',
            borderRadius: 4,
          }}
        >
          <EmailIcon
            sx={{
              fontSize: 70,
              color: 'primary.main',
              mb: 2,
            }}
          />

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Syrenahs Outlook Portal
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Sign in with your Microsoft account to view your email report.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={login}
            startIcon={<SecurityIcon />}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Sign in with Microsoft
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #9f1bf7 0%, #ffffff 40%)',
        p: {
          xs: 1,
          sm: 2,
          md: 3,
        },
      }}
    >
      <OutlookHeader
        account={account}
        loading={loading}
        onRefresh={() => loadEmails(account, timeframe)}
        onLogout={logout}
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <ReportTimeframe
        timeframe={timeframe}
        onChange={handleTimeframeChange}
        loading={loading}
      />

      <SenderReport
        senders={senderData}
        selectedSenders={selectedSenders}
        onSenderToggle={toggleSender}
        onBlockSender={setSenderToBlock}
        getUnsubscribeLinks={findUnsubscribeLinks}
      />

     <JobPane jobs={jobs}/>

      <EmailReport
        emails={filteredEmails}
        selectedSenders={selectedSenders}
        selectedEmails={selectedEmails}
        loading={loading}
        onEmailClick={handleEmailClick}
        onToggleEmail={toggleEmailSelection}
        onToggleSelectAll={toggleSelectAll}
        onDelete={() => setDeleteDialogOpen(true)}
      />

      <BlockSenderDialog
        sender={senderToBlock}
        loading={blocking}
        onClose={() => setSenderToBlock(null)}
        onConfirm={blockSender}
      />

      <DeleteEmailsDialog
        open={deleteDialogOpen}
        emails={emails}
        selectedEmails={selectedEmails}
        loading={deleting}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={deleteSelectedEmails}
      />

      <EmailDialog
        email={selectedEmail}
        loading={emailLoading}
        sanitizedBody={sanitizedBody}
        onClose={() => setSelectedEmail(null)}
      />
    </Box>
  );
}

export default OutlookReport;
