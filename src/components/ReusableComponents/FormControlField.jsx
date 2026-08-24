import { memo } from 'react';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

function FormControlField({
  type = 'select',
  label,
  value,
  onChange,
  options = [],
  placeholder,
  selectId,
}) {
  if (type === 'text') {
    return (
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputProps={{ 'aria-label': label }}
      />
    );
  }
//TODO: ADD NUMBER PICKER OPTION
  return (
    <FormControl fullWidth>
      <InputLabel id={`${selectId}-label`}>{label}</InputLabel>
      <Select
        labelId={`${selectId}-label`}
        value={value}
        label={label}
        onChange={onChange}
        inputProps={{ 'aria-label': label }}
      >
        {options.map((option) => (
          <MenuItem value={option.value} key={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default memo(FormControlField);
