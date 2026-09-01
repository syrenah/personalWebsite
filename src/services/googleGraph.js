const GOOGLE_GRAPH_BASE_URL = 'https://gmail.googleapis.com/gmail/v1';

export const googleGraphService = {
  async getProfile(accessToken) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google profile request failed: ${response.status}`);
    }

    return response.json();
  },

  async getMessages(accessToken, params = {}) {
    const query = new URLSearchParams({
      maxResults: String(params.maxResults ?? 50),
      ...params,
    });

    const response = await fetch(`${GOOGLE_GRAPH_BASE_URL}/users/me/messages?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google messages request failed: ${response.status}`);
    }

    return response.json();
  },

  async getMessage(accessToken, messageId) {
    const response = await fetch(`${GOOGLE_GRAPH_BASE_URL}/users/me/messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google message request failed: ${response.status}`);
    }

    return response.json();
  },

  async getThread(accessToken, threadId) {
    const response = await fetch(`${GOOGLE_GRAPH_BASE_URL}/users/me/threads/${threadId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google thread request failed: ${response.status}`);
    }

    return response.json();
  },

  async sendMessage(accessToken, payload) {
    const response = await fetch(`${GOOGLE_GRAPH_BASE_URL}/users/me/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Google send message request failed: ${response.status}`);
    }

    return response.json();
  },
};
