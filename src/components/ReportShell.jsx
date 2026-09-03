import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box } from '@mui/material';

import ReportTimeframe from './ReportTimeframe';
import SenderReport from './SenderReport';
import EmailReport from './EmailReport';
import BlockSenderDialog from './BlockSenderDialog';
import DeleteEmailsDialog from './DeleteEmailsDialog';
import EmailDialog from './EmailDialog';
import JobPane from './JobPane';
import Header from './Header';
import SuspiciousityDrawer from './SuspiciousityDrawer';

import {
  extractUnsubscribeLinks,
  getDateRangeForDays,
  sanitizedBody,
} from '../utils/emailUtils';

function ReportShell({
  account,
  getAccessToken,
  graphApi,
  onLogout,
  header,
}) {
  const [allEmails, setAllEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState(7);
  const [selectedSenders, setSelectedSenders] = useState([]);
  const [emailsSelectedForDeletion, setEmailsSelectedForDeletion] = useState([]);
  const [emailsSelectedForViewing, setEmailsSelectedForViewing] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [singleEmail, setSingleEmail] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [senderToBlock, setSenderToBlock] = useState(null);
  const [blocking, setBlocking] = useState(false);
  const [jobs, setJobs] = useState([]);

  const {
    getMessages,
    getFolders,
    getMessageBody,
    getMessageHeaders,
    moveMessageToDeletedItems,
    reportMessageAsJunk,
  } = graphApi;

  const loadEmails = async (selectedTimeframe = timeframe) => {
    if (!account) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken(account);

      if (!accessToken) {
        return;
      }

      const { start, end } = getDateRangeForDays(selectedTimeframe);
      const formatted = await getMessages(accessToken, start, end);
      const deletedFolder = await getFolders(accessToken);
      const filtered = deletedFolder
        ? formatted.filter((email) => email.parentFolderId !== deletedFolder.id)
        : formatted;

      setAllEmails(filtered);
      refreshSenderData(filtered);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadEmails(timeframe);
    }
  }, [account, timeframe]);

  useEffect(() => {
    setEmailsSelectedForViewing(
      allEmails.filter((email) => selectedSenders.includes(email.senderEmail))
    );
  }, [allEmails, selectedSenders]);

  const [senderData, setSenderData] = useState([]);

  const refreshSenderData = (emails) => {
    const groups = {};

    emails.forEach((email) => {
      const key = email.senderEmail || email.sender || 'Unknown';

      if (!groups[key]) {
        groups[key] = {
          sender: email.sender || 'Unknown',
          senderEmail: email.senderEmail || '',
          count: 0,
          unsubscribeLinks: email.unsubscribeLinks || [],
        };
      }

      groups[key].count += 1;

      if (
        email.unsubscribeLinks?.length > 0 &&
        groups[key].unsubscribeLinks.length === 0
      ) {
        groups[key].unsubscribeLinks = email.unsubscribeLinks;
      }
    });

    setSenderData(Object.values(groups).sort((a, b) => b.count - a.count));
  };

  const findUnsubscribeLinks = async (senderEmail) => {
    if (!account || !senderEmail) {
      return [];
    }

    try {
      const email = allEmails.find((item) => item.senderEmail === senderEmail);

      if (!email) {
        return [];
      }

      const accessToken = await getAccessToken(account);

      if (!accessToken) {
        return [];
      }

      const data = await getMessageHeaders(accessToken, email.id);

      if (!data?.internetMessageHeaders) {
        return [];
      }

      return extractUnsubscribeLinks(data.internetMessageHeaders);
    } catch (err) {
      console.error(`Unable to find unsubscribe links for ${senderEmail}:`, err);
      return [];
    }
  };

  const toggleSender = (senderEmail) => {
    setSelectedSenders((current) => {
      if (current.includes(senderEmail)) {
        return current.filter((value) => value !== senderEmail);
      }

      return [...current, senderEmail];
    });
  };

  const toggleEmailSelection = (emailId) => {
    setEmailsSelectedForDeletion((current) => {
      if (current.includes(emailId)) {
        return current.filter((id) => id !== emailId);
      }

      return [...current, emailId];
    });
  };

  const removeEmailFromDeletionList = (emailId) => {
    setEmailsSelectedForDeletion((current) =>
      current.filter((id) => id !== emailId)
    );
  };

  const toggleSelectAll = () => {
    setEmailsSelectedForDeletion((current) => {
      const allVisibleSelected =
        emailsSelectedForViewing.length > 0 &&
        emailsSelectedForViewing.every((email) => current.includes(email.id));

      if (allVisibleSelected) {
        return current.filter(
          (id) => !emailsSelectedForViewing.some((email) => email.id === id)
        );
      }

      return [
        ...new Set([
          ...current,
          ...emailsSelectedForViewing.map((email) => email.id),
        ]),
      ];
    });
  };

  const handleEmailClick = async (email) => {
    setSingleEmail({ ...email, body: '' });
    setEmailLoading(true);

    try {
      const accessToken = await getAccessToken(account);

      if (!accessToken) {
        return;
      }

      const data = await getMessageBody(accessToken, email.id);
      const unsubscribeLinks = extractUnsubscribeLinks(
        data.internetMessageHeaders || []
      );

      setSingleEmail({
        ...email,
        body: data.body?.content || '',
        unsubscribeLinks,
        internetMessageHeaders: data.internetMessageHeaders || [],
        unsubscribeEnabled: data.unsubscribeEnabled,
        unsubscribeData: data.unsubscribeData,
      });
    } catch (err) {
      console.error(err);
      setSingleEmail(null);
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

      const senderMessage = allEmails.find(
        (email) => email.senderEmail === senderToBlock.senderEmail
      );

      if (!senderMessage) {
        throw new Error('Could not find an email from this sender.');
      }

      await reportMessageAsJunk(accessToken, senderMessage.id);
      setSenderToBlock(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBlocking(false);
    }
  };

  const createBlockJob = async (sendersToBlock) => {
    if (sendersToBlock.length === 0) {
      return;
    }

    setError(null);

    try {
      const accessToken = await getAccessToken(account);

      if (!accessToken) {
        return;
      }

      const jobId = crypto.randomUUID();
      const job = {
        id: jobId,
        type: 'block',
        name: `Blocking ${sendersToBlock.length} senders`,
        total: sendersToBlock.length,
        completed: 0,
        failed: 0,
        status: 'running',
        senders: sendersToBlock,
      };

      setJobs((current) => [...current, job]);
      runBlockJob(jobId, sendersToBlock, accessToken);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const runBlockJob = async (jobId, sendersToBlock, accessToken) => {
    let completed = 0;
    let failed = 0;

    const updateJob = () => {
      setJobs((current) =>
        current.map((job) =>
          job.id === jobId ? { ...job, completed, failed } : job
        )
      );
    };

    for (const sender of sendersToBlock) {
      try {
        const senderMessage = allEmails.find(
          (email) => email.senderEmail === sender.senderEmail
        );

        if (!senderMessage) {
          throw new Error(`Could not find an email from ${sender.senderEmail}.`);
        }

        await reportMessageAsJunk(accessToken, senderMessage.id);
        completed++;
      } catch (error) {
        console.error(`Unable to block ${sender.senderEmail}:`, error);
        failed++;
      }

      updateJob();
    }

    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              completed,
              failed,
              status: failed > 0 ? 'complete-with-errors' : 'complete',
            }
          : job
      )
    );
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
      emails: emailIds,
    };

    setEmailsSelectedForViewing((current) =>
      current.filter((email) => !emailIds.includes(email.id))
    );

    setJobs((current) => [...current, job]);

    await runDeleteJob(jobId, emailIds, accessToken);
  };

  const runDeleteJob = async (jobId, emailIds, accessToken) => {
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

    for (const emailId of emailIds) {
      try {
        await moveMessageToDeletedItems(accessToken, emailId);
        setAllEmails((current) => current.filter((email) => email.id !== emailId));
        completed++;
      } catch (error) {
        failed++;
      }

      updateJob();
    }

    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              completed,
              failed,
              status: failed > 0 ? 'complete-with-errors' : 'complete',
            }
          : job
      )
    );
  };

  const deleteSelectedEmails = async () => {
    setDeleteDialogOpen(false);

    if (emailsSelectedForDeletion.length === 0) {
      return;
    }

    setError(null);

    try {
      const accessToken = await getAccessToken(account);

      if (!accessToken) {
        throw new Error('Unable to obtain access token');
      }

      await createDeleteJob(emailsSelectedForDeletion, accessToken);
      setEmailsSelectedForDeletion([]);
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message);
    }
  };

  const allVisibleSelected = useMemo(
    () =>
      emailsSelectedForViewing.length > 0 &&
      emailsSelectedForViewing.every((email) =>
        emailsSelectedForDeletion.includes(email.id)
      ),
    [emailsSelectedForDeletion, emailsSelectedForViewing]
  );

  const someVisibleSelected = useMemo(
    () =>
      emailsSelectedForViewing.some((email) =>
        emailsSelectedForDeletion.includes(email.id)
      ) && !allVisibleSelected,
    [allVisibleSelected, emailsSelectedForDeletion, emailsSelectedForViewing]
  );

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
      {header || (
        <Header
          account={account}
          loading={loading}
          onRefresh={() => loadEmails(timeframe)}
          onLogout={onLogout}
        />
      )}

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
        onChange={(nextTimeframe) => setTimeframe(nextTimeframe)}
        loading={loading}
      />

      <SenderReport
        senders={senderData}
        selectedSenders={selectedSenders}
        onSenderToggle={toggleSender}
        onBlockSender={setSenderToBlock}
        onBlockSelected={createBlockJob}
        getUnsubscribeLinks={findUnsubscribeLinks}
      />

      <JobPane jobs={jobs} />

      <EmailReport
        emailsSelectedForDeletion={emailsSelectedForDeletion}
        selectedEmails={emailsSelectedForViewing}
        loading={loading}
        onEmailClick={handleEmailClick}
        onToggleEmail={toggleEmailSelection}
        onToggleSelectAll={toggleSelectAll}
        onDelete={() => setDeleteDialogOpen(true)}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
      />

      <BlockSenderDialog
        sender={senderToBlock}
        loading={blocking}
        onClose={() => setSenderToBlock(null)}
        onConfirm={blockSender}
      />

      <DeleteEmailsDialog
        open={deleteDialogOpen}
        emails={allEmails}
        selectedEmails={emailsSelectedForDeletion}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={deleteSelectedEmails}
        onRemoveEmail={removeEmailFromDeletionList}
        onEmailClick={handleEmailClick}
      />

      <SuspiciousityDrawer
        emails={allEmails}
        onReportSenders={createBlockJob}
        onEmailClick={handleEmailClick}
        onDeleteEmails={(emailIds) => {
          setEmailsSelectedForDeletion(emailIds);
          setDeleteDialogOpen(true);
        }}
      />

      <EmailDialog
        email={singleEmail}
        loading={emailLoading}
        sanitizedBody={singleEmail?.body ? sanitizedBody(singleEmail.body) : ''}
        onClose={() => setSingleEmail(null)}
      />
    </Box>
  );
}

export default ReportShell;
