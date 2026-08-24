import React, { useEffect, useState } from 'react';
import Notebook from './components/Notebook';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

function App() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Open the dialog once on mount
    setOpen(true);
  }, []);

  return (
    <>
      <Notebook />

      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="under-construction-title">
        <DialogTitle id="under-construction-title">Under Construction</DialogTitle>
        <DialogContent>
          <Typography>This app is currently under construction. I just Started this Yesterday</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;
