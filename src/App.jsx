import React, { useEffect, useState } from 'react';
import Notebook from './components/Notebook';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import NamePopup from './NamePopup';
function App() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Open the dialog once on mount
    setOpen(true);
  }, []);

  return (
    <>
     Hi {localStorage.getItem('name')}

      <Notebook/>
<NamePopup/>
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="under-construction-title">
        <DialogTitle id="under-construction-title">Under Construction</DialogTitle>
        <DialogContent>
          <Typography>This app is currently under construction. 
            I just Started this Yesterday.
            Tip: The Tabs are reorderable </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;
