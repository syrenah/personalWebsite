import React from 'react';
import ReportShell from './components/ReportShell';

function GoogleReport() {
  const account = { name: 'Google Account', username: 'google@example.com' };

  const getAccessToken = async () => null;

  const graphApi = {
    getMessages: async () => [],
    getFolders: async () => null,
    getMessageBody: async () => ({ body: { content: '' } }),
    getMessageHeaders: async () => ({ internetMessageHeaders: [] }),
    moveMessageToDeletedItems: async () => undefined,
    reportMessageAsJunk: async () => undefined,
  };

  return (
    <ReportShell
      account={account}
      getAccessToken={getAccessToken}
      graphApi={graphApi}
      onLogout={() => undefined}
      header={<div />}
    />
  );
}

export default GoogleReport;
