import React, { useState } from 'react';
import Grid from './Grid';
import { Box, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { ACCENT_RED } from '../../config/contants';
import FormControlField from '../reusableComponents/FormControlField';
import { FormControl, InputLabel } from '@mui/material';


function ColorPicker({ color, onChange }) {
  return (
    <HexColorPicker
      color={color}
      onChange={onChange}
      style={{
        width: "100%",
        height: "300px",
      }}
    />
  );
}
function Perlergrid() {
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);
  const [size, setSize] = useState(20);
  const [shape, setShape] = useState('square');
  const [color, setColor] = useState(ACCENT_RED);

  return (

        <Box component="main" className="app-shell">
      <Paper component="section" className="container" elevation={3}>
       
    <section style={{ marginTop: 20 }}>
       <Stack direction={{ xs: 'row' }} spacing={2} className="top-row">
          <FormControlField
            type="text"
            label="Width"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value) || 0)}
            placeholder="columns"
            selectId="perler-width"
          />
        

    
          <FormControlField
            type="text"
            label="Height"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value) || 0)}
            placeholder="rows"
            selectId="perler-height"
          />
      

          <FormControlField
            type="text"
            label="Size"
            value={size}
            onChange={(e) => setSize(Number(e.target.value) || 0)}
            placeholder="px"
            selectId="perler-size"
          />
      

 
          <FormControlField
            label="Shape"
            value={shape}
            onChange={(e) => setShape(e.target.value)}
            options={[{ label: 'Square', value: 'square' }, { label: 'Circle', value: 'circle' }, { label: 'Hole', value: 'hole' }]}
            selectId="perler-shape"
          />
    


              
       
     </Stack>
      <div style={{ marginTop: 20, width: '100%' }}>
        <ColorPicker color={color} onChange={setColor} />
      </div>
          
      <Grid width={width} height={height} size={size} shape={shape} activeColor={color} gap={4} />
    </section>
       </Paper>
    </Box>
  );
}

export default Perlergrid;
