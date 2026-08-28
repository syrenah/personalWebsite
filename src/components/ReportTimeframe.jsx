import React from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';

export const TIMEFRAMES = [
    { label: 'Last 1 Week ', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 60 Days', days: 60 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last 180 Days', days: 180 },
  { label: 'Last Year', days: 365 },
];

function ReportTimeframe({ timeframe, onChange, loading }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
      >
        <Typography fontWeight="bold" sx={{ minWidth: 140 }}>
          Report timeframe
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          {TIMEFRAMES.map((option) => (
            <Button
            
              key={option.days}
              variant={timeframe === option.days ? 'contained' : 'outlined'}
              onClick={() => onChange(option.days)}
              disabled={loading}
              size="small"
              sx={{ textTransform: 'none' ,
                // backgroundColor: '#760299' ,
                            // Normal
        //  backgroundColor: 'rgba(255,255,255,.2)',                      
     backgroundColor: "#7C3AED",
    color: "#FFFFFF",
    borderRadius: "8px",
    padding: "8px 18px",
    fontWeight: 600,
    textTransform: "none",
    boxShadow: "0 2px 6px rgba(124, 58, 237, 0.25)",

    // Smooth transitions
    transition: "all 0.2s ease",

    // Hover
    "&:hover": {
      backgroundColor: "#6D28D9",
      boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)",
      transform: "translateY(-1px)",
    },

    // Active / pressed
    "&:active": {
      backgroundColor: "#5B21B6",
      transform: "translateY(0)",
      boxShadow: "0 2px 6px rgba(91, 33, 182, 0.35)",
    },

    // Selected
    "&.Mui-selected": {
      backgroundColor: "#a989dd",
      color: "#e61111",
      boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.25)",
    },

    // Selected + hover
    "&.Mui-selected:hover": {
      backgroundColor: "#4C1D95",
    },

    // Keyboard focus
    "&:focus-visible": {
      outline: "3px solid rgba(124, 58, 237, 0.35)",
      outlineOffset: "2px",
    },

    // Disabled
    "&.Mui-disabled": {
      backgroundColor: "#E9D5FF",
      color: "#A78BFA",
      boxShadow: "none",
      transform: "none",
    },

              }}
            >
              {option.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default ReportTimeframe;
