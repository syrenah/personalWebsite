import { memo } from 'react';
import { Box, Checkbox, FormControlLabel, Typography,Stack } from '@mui/material';
import {
  BEHAVIOR_OPTIONS,
  FILTER_OPTIONS,
  OUTPUT_OPTIONS,
  SCOPE_OPTIONS,
} from '../../config/options';

function OptionGroup({ selectedOptions, onToggle, fieldSelectorOptions }) {
  const groups = [
    { title: 'Output Format', options: OUTPUT_OPTIONS },
    // { title: 'Field Selector', options: fieldSelectorOptions },
    // { title: 'Filtering', options: FILTER_OPTIONS },
    // { title: 'Scope', options: SCOPE_OPTIONS },
    { title: 'Behavior', options: BEHAVIOR_OPTIONS },
  ];

  return (
    <Box className="verticalpadding" >
         <Stack direction={{ sm: 'column', md: 'row' }} spacing={2} >
      {groups.map((group) => (
        <Box key={group.title} className="group">
          <Typography variant="h6" >
            {group.title} 
          </Typography>


          {group.options.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={selectedOptions.includes(option.value)}
                  onChange={() => onToggle(option.value)}
                  inputProps={{ 'aria-label': option.label }}
                />
              }
              label={option.label}
            />
          ))}






        </Box>
      ))}


</Stack>

    </Box>
  );
}

export default memo(OptionGroup);
