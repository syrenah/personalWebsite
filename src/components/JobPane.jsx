import { Chip, Box,   Stack, Paper, Typography } from '@mui/material';
import JobItem from './JobItem';

const EMPTY_JOBS = [];
function JobPane({ jobs = EMPTY_JOBS }) {

  const activeJobs = jobs.filter(
    (job) => job.status === 'running'
  );


  return (
    <Paper
        sx={{
        mb: 3,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontWeight="bold">
            ⚙️ Jobs
          </Typography>

          <Chip
            size="small"
            label={activeJobs.length}
          />
        </Stack>
      </Box>

      {/* <Divider /> */}

      {jobs.map((job) => (
        <JobItem
          key={job.id}
          job={job}
        />
      ))}
    </Paper>
  );
}

export default JobPane;