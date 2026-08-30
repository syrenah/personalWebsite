const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
const GRAPH_BETA_URL = 'https://graph.microsoft.com/beta';

const authHeaders = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

export async function getMessages(accessToken, startDate, endDate) {
  const start = new Date(startDate).toISOString();
  const end = new Date(endDate).toISOString();

  let url =
    `${GRAPH_BASE_URL}/me/messages` +
    '?$select=id,sender,subject,receivedDateTime,isRead,hasAttachments,parentFolderId' +
    `&$filter=receivedDateTime ge ${start} and receivedDateTime le ${end}` +
    '&$orderby=receivedDateTime DESC' +
    '&$top=100';

  const allEmails = [];

  while (url) {
    const response = await fetch(url, {
      headers: authHeaders(accessToken),
    });

    if (!response.ok) {
      throw new Error(`Microsoft Graph error ${response.status}`);
    }

    const data = await response.json();
    allEmails.push(...data.value);
    url = data['@odata.nextLink'] || null;
  }

  return allEmails.map((email) => ({
    id: email.id,
    sender: email.sender?.emailAddress?.name || 'Unknown',
    senderEmail: email.sender?.emailAddress?.address || '',
    subject: email.subject || '(No subject)',
    received: email.receivedDateTime,
    status: email.isRead ? 'Read' : 'Unread',
    attachment: email.hasAttachments ? 'Yes' : 'No',
    parentFolderId: email.parentFolderId,
    unsubscribeLinks: [],
  }));
}

export async function getMessageHeaders(accessToken, messageId) {
  const response = await fetch(
    `${GRAPH_BASE_URL}/me/messages/${messageId}?$select=internetMessageHeaders`,
    {
      headers: authHeaders(accessToken),
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}



export async function getFolders(accessToken, messageId) {
  const response = await fetch(
     `${GRAPH_BASE_URL}/me/mailFolders?$select=id,displayName,parentFolderId`,
    {
      headers: authHeaders(accessToken),
    }
  );
   
  if (!response.ok) {
    return null;
  }
  
  const data =  await response.json();
 

  return [...data.value].filter(f => f.displayName =="Deleted Items")[0];
}



export async function getMessageBody(accessToken, messageId) {

  const response = await fetch(
    `${GRAPH_BASE_URL}/me/messages/${messageId}?$select=subject,sender,toRecipients,receivedDateTime,body,internetMessageHeaders`,
    {
      headers: {
        ...authHeaders(accessToken),
        Prefer: 'outlook.body-content-type="html"',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to load email (${response.status})`);
  }

  return response.json();
}

export async function getMessageMetadata(accessToken, messageId) {

  const response = await fetch(
    `${GRAPH_BASE_URL}/me/messages/${messageId}?$select=subject,sender,toRecipients,receivedDateTime,internetMessageHeaders`,
    {
      headers: {
        ...authHeaders(accessToken),
        Prefer: 'outlook.body-content-type="html"',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to load email (${response.status})`);
  }

  return response.json();
}

export async function reportMessageAsJunk(accessToken, messageId) {
  const response = await fetch(
    `${GRAPH_BETA_URL}/me/messages/${messageId}/reportMessage`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        IsMessageMoveRequested: true,
        ReportAction: 'junk',
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Unable to block sender (${response.status}): ${message}`
    );
  }
}

export async function moveMessageToDeletedItems(accessToken, messageId) {

  const response = await fetch(
    `${GRAPH_BASE_URL}/me/messages/${messageId}/move`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destinationId: 'deleteditems',
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to delete email (${response.status})`);
  }
}
