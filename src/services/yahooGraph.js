const YAHOO_GRAPH_BASE_URL = 'https://mail.yahooapis.com/ws/mail/v1';

export const yahooGraphService = {
  async getProfile(accessToken) {
    const response = await fetch('https://social.yahooapis.com/v1/user/me/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo profile request failed: ${response.status}`);
    }

    return response.json();
  },

  async getMessages(accessToken, params = {}) {
    const query = new URLSearchParams({
      format: 'json',
      ...params,
    });

    const response = await fetch(`${YAHOO_GRAPH_BASE_URL}/messages?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo messages request failed: ${response.status}`);
    }

    return response.json();
  },

  async getMessage(accessToken, messageId) {
    const response = await fetch(`${YAHOO_GRAPH_BASE_URL}/messages/${encodeURIComponent(messageId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo message request failed: ${response.status}`);
    }

    return response.json();
  },

  async getFolders(accessToken) {
    const response = await fetch(`${YAHOO_GRAPH_BASE_URL}/folders`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo folders request failed: ${response.status}`);
    }

    return response.json();
  },

  async sendMessage(accessToken, payload) {
    const response = await fetch(`${YAHOO_GRAPH_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Yahoo send message request failed: ${response.status}`);
    }

    return response.json();
  },
};
