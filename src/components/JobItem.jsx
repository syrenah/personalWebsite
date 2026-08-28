import { Chip, Box,   Stack, Paper, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LinearProgress from '@mui/material/LinearProgress';

function JobItem({ job  = {}}) {
  const percentage =
    job.total === 0
      ? 0
      : Math.round(
          (job.completed / job.total) * 100
        );

  return (
    <Box sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        {/* <DeleteIcon fontSize="small" /> */}

        <Typography
          fontWeight="bold"
          sx={{ flex: 1 }}
        >
          {job.name}
        </Typography>
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
    </Box>
  );
}
export default JobItem;