import React, { useEffect, useState } from 'react';
import { BLACK } from '../../config/contants';
import { Stack } from '@mui/material';
import SingleSquare from './SingleSquare';

function Grid({ width = 8, height = 8, size = 24,
   shape = 'square', color = BLACK, activeColor,
  style = {} }) {
  const cols = Math.max(0, Math.floor(width));
  const rows = Math.max(0, Math.floor(height));
  const total = cols * rows;

  // activeColor takes precedence, fall back to legacy `color` prop
  const pickerColor = activeColor ?? color;

  const [cellColors, setCellColors] = useState(() => Array(total).fill(null));

  // Resize/retain existing colors when grid dimensions change
  useEffect(() => {
    setCellColors((current) => {
      const next = Array(total).fill(null);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (idx < current.length) next[idx] = current[idx];
        }
      }
      return next;
    });
  }, [cols, rows, total]);


  const handleCellClick = (index) => {
    if (!pickerColor) return;
    setCellColors((current) => {
      const next = current.slice();
      next[index] = pickerColor;
      return next;
    });
  };

  const cells = Array.from({ length: total }, (_, i) => (
    <SingleSquare
      key={i}
      shape={shape}
      color={cellColors[i] || 'transparent'}
      size={size}
      onClick={() => handleCellClick(i)}
    />
  ));

   const rows2 = [];

    for (let i = 0; i < cells.length; i += cols) {
      rows2.push(
        <Stack
          key={i}
          direction={{ xs: "row", sm: "row" }}
         
          sx={{ width: "100%" }}
        >
          {cells.slice(i, i + cols).map((component, index) => (
            <React.Fragment key={index}>
              {component}
            </React.Fragment>
          ))}
        </Stack>
      );
    }

    return (
      <Stack  sx={{ width: "100%" }}>
        {rows2}
      </Stack>
    );





  // return (
  //   <div  >
  //     {cells} 
  //   </div>
  // );
}

export default Grid;
