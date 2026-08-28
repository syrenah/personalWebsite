export const formatDate = (dateString) => {
  if (!dateString) return '';

  return new Date(dateString).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatShortDate = (dateString) => {
  if (!dateString) return '';

  return new Date(dateString).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const isValidUnsubscribeUrl = (value) => {
  if (!value) return false;

  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' ||
      url.protocol === 'http:' ||
      url.protocol === 'mailto:'
    );
  } catch {
    return false;
  }
};

export const extractUnsubscribeLinks = (headers = []) => {
  const header = headers.find(
    (item) => item.name?.toLowerCase() === 'list-unsubscribe'
  );

  if (!header?.value) {
    return [];
  }

  const matches = header.value.match(/<([^>]+)>/g) || [];

  return matches
    .map((value) => value.replace(/^<|>$/g, '').trim())
    .filter(isValidUnsubscribeUrl);
};

export const getDateRangeForDays = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};
