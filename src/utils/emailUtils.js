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

export const getDateRangeForDays = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};
