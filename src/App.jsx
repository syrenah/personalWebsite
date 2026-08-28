import React, { useEffect, useState } from 'react';
// import Notebook from './components/Notebook';
// import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
// import NamePopup from './NamePopup';
import OutlookReport from './OutlookReport';
// import OutlookPortal from './OutlookPortal';

function App() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Open the dialog once on mount
    setOpen(true);
  }, []);

  return (
    <>

<OutlookReport/>



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
