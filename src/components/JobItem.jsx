import { useState } from 'react';
import { Box, Collapse, Divider, IconButton, Stack, Typography } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinearProgress from '@mui/material/LinearProgress';

function JobItem({ job = {} }) {
  const [expanded, setExpanded] = useState(false);
  const percentage =
    job.total === 0
      ? 0
      : Math.round(
          (job.completed / job.total) * 100
        );

  const includedItems = job.type === 'block'
    ? job.senders || []
    : job.emailDetails || [];

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        onClick={() => setExpanded((current) => !current)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setExpanded((current) => !current);
          }
        }}
        sx={{ cursor: 'pointer' }}
      >
        <Typography
          fontWeight="bold"
          sx={{ flex: 1 }}
        >
          {job.name}
        </Typography>
        <IconButton
          size="small"
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${job.name}`}
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Stack>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5 }}
      >
        {job.completed} / {job.total}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{ mt: 1 }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {job.status === 'running'
          ? `${job.total - job.completed} remaining`
          : job.status === 'complete'
            ? 'Complete'
            : 'Some emails failed'}
      </Typography>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ mt: 1.5, mb: 1 }} />
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Included {job.type === 'block' ? 'senders' : 'emails'}
        </Typography>
        <Stack spacing={0.75} sx={{ maxHeight: 240, overflowY: 'auto' }}>
          {includedItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No details available.
            </Typography>
          ) : (
            includedItems.map((item, index) => (
              <Box
                key={job.type === 'block' ? item.senderEmail : item.id || index}
                sx={{ p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}
              >
                {job.type === 'block' ? (
                  <>
                    <Typography variant="body2" fontWeight={600}>
                      {item.sender}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.senderEmail}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {item.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.senderEmail}
                    </Typography>
                  </>
                )}
              </Box>
            ))
          )}
        </Stack>
      </Collapse>
    </Box>
  );
}
export default JobItem;