import DOMPurify from 'dompurify';
export const sanitizedBody = (body) => {
   if (!body) {
       return '';
     }
 
     return DOMPurify.sanitize(body, {
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
};




export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  const formattedDate = date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${formattedDate} ${formattedTime}`;
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

export const getSpamLikelihood = ({
  senderEmail = '',
  subject = '',
  headers = [],
} = {}) => {
  const email = senderEmail.trim().toLowerCase();
  const reasons = [];
  let score = 0;
  const addSignal = (points, reason) => {
    score += points;
    reasons.push(reason);
  };

  const atIndex = email.lastIndexOf('@');
  const localPart = atIndex > 0 ? email.slice(0, atIndex) : '';
  const domain = atIndex > 0 ? email.slice(atIndex + 1) : '';
  const digitCount = (email.match(/\d/g) || []).length;

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    addSignal(2, 'The sender address is malformed.');
  }

  if (email.length > 50) {
    addSignal(1, 'The sender address is unusually long.');
  }

  if (digitCount > 5) {
    addSignal(2, 'The sender address contains more than five numbers.');
  }

  if (localPart.length > 30) {
    addSignal(1, 'The sender name is unusually long.');
  }

  if (domain && /\.(ru|cn|tk|top|xyz|click|zip)$/i.test(domain)) {
    addSignal(1, 'The sender uses a domain commonly seen in spam.');
  }

  const normalizedHeaders = headers.map((header) => ({
    name: header.name?.toLowerCase() || '',
    value: header.value?.toLowerCase() || '',
  }));

  const spamStatus = normalizedHeaders.find(
    (header) => header.name === 'x-spam-status' || header.name === 'x-spam-flag'
  );
  if (spamStatus && /yes|true|spam/.test(spamStatus.value)) {
    addSignal(3, 'A mail server marked this message as spam.');
  }

  const authenticationResults = normalizedHeaders.find(
    (header) => header.name === 'authentication-results'
  );
  if (authenticationResults && /fail|softfail|none/.test(authenticationResults.value)) {
    addSignal(2, 'Email authentication did not pass.');
  }

  const replyTo = normalizedHeaders.find(
    (header) => header.name === 'reply-to'
  );
  const replyToEmail = replyTo?.value.match(/<([^>]+)>|([\w.+-]+@[\w.-]+)/)?.[1]
    || replyTo?.value.match(/<([^>]+)>|([\w.+-]+@[\w.-]+)/)?.[2];
  if (replyToEmail && domain && !replyToEmail.toLowerCase().endsWith(`@${domain}`)) {
    addSignal(1, 'The reply address uses a different domain.');
  }

  if (/\b(urgent|winner|claim|prize|free money|act now)\b/i.test(subject)) {
    addSignal(1, 'The subject uses common spam language.');
  }

  return {
    isLikelySpam: score >= 2,
    score,
    reasons,
  };
};

export const getDateRangeForDays = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};
