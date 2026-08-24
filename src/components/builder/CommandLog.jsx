import { Box, Typography } from '@mui/material';
import DOMPurify from 'dompurify';

function escapeForDisplay(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function CommandLog({ title, content, className = '' }) {
  const safeTitle = DOMPurify.sanitize(escapeForDisplay(title));
  const safeContent = DOMPurify.sanitize(escapeForDisplay(typeof content === 'string' ? content : String(content)));

  return (
    <Box className={`terminal ${className}`.trim()}>
      <Typography variant="subtitle2" className="terminal-title">
        {safeTitle}
      </Typography>
      <Box component="pre" className="terminal-pre">
        {safeContent}
      </Box>
    </Box>
  );
}

export default CommandLog;
