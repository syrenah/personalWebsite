import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

function NamePopup() {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(
    !localStorage.getItem('name')
  );

  const handleSubmit = () => {
    if (!name.trim()) return;

    localStorage.setItem('name', name.trim());
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <DialogTitle>What's your name?</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSubmit}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NamePopup;