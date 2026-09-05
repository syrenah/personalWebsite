import React, { useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
// import Notebook from './components/Notebook';
// import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
// import NamePopup from './NamePopup';
import OutlookReport from './OutlookReport';
import GoogleReport from './GoogleReport';
// import OutlookPortal from './OutlookPortal';

function App() {
  const [selectedReport, setSelectedReport] = useState('outlook');

  return (
    <>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant={selectedReport === 'google' ? 'contained' : 'outlined'}
            onClick={() => setSelectedReport('google')}
          >
            Google
          </Button>
          <Button
            variant={selectedReport === 'outlook' ? 'contained' : 'outlined'}
            onClick={() => setSelectedReport('outlook')}
          >
            Outlook
          </Button>
        </Stack>
      </Box>

      {selectedReport === 'google' ? <GoogleReport /> : <OutlookReport />}

     {/* Hi {localStorage.getItem('name')} */}

      {/* <Notebook/> */}
{/*       
<NamePopup/>
    <Dialog
  open={open}
  onClose={() => setOpen(false)}
  aria-labelledby="under-construction-title"
  maxWidth="xs"
  fullWidth
>
  <DialogTitle id="under-construction-title">
    Under Construction
  </DialogTitle>

  <DialogContent>
    <Typography>
      This app is currently under construction.
      I just Started this Yesterday. Check back for new content daily.
      Tip: The Tabs are reorderable
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpen(false)} color="primary">
      Close
    </Button>
  </DialogActions>
</Dialog> */}



    </>
  );
}

export default App;
