import React, { useState } from 'react';
import CommandBuilder from './CommandBuilder';
import Perlergrid from './PerlerPainter/Perlergrid';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BRAND_BLUE, TERMINAL_BG,BRAND_BLUE_DARK ,MOCK_OUTPUT} from '../config/contants';
import Syrenah from './SyrenahsStuff/Syrenah';

function Notebook() {
  const [tab, setTab] = useState(0);

  const CuteTab = styled(Tab)(({ theme }) => ({
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: BRAND_BLUE,
    color: 'white',
    marginTop:'5px',
    fontWeight: 'bold',
    border: '1px solid #ccc',
    minWidth: 'auto',
    // clipPath: 'polygon(0 100%, 0 0, 85% 0, 100% 50%, 85% 100%)',
    scrollMarginLeft: theme.spacing(1),
    //  scrollMarginTop: theme.spacing(1),
    '&.Mui-selected': {
      backgroundColor: TERMINAL_BG,
       color: 'white',
    },
    '&.Mui-focusVisible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },
      '&:hover': {
          backgroundColor: MOCK_OUTPUT,
          color:'black',
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },


  borderTopRightRadius: '15px',
  borderTopLeftRadius: '15px',
 

  }));

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
      
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          aria-label="Notebook tabs"
          TabIndicatorProps={{ style: { display: 'none' } }}
        >
          <CuteTab disableRipple label="Command Builder" />
          <CuteTab disableRipple label="Perler Grid" />
          <CuteTab disableRipple label="About Syrenah" />
        </Tabs>
      </Box>

      <Box>
        {tab === 0 && <CommandBuilder />}
        {tab === 1 && <Perlergrid />}
          {tab === 2 && <Syrenah />}
      </Box>
    </Box>
  );
}

export default Notebook;
