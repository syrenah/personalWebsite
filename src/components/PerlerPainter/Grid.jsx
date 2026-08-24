import React, { useEffect, useState } from 'react';
import { BLACK } from '../../config/contants';
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


  const handleCellClick = (index) => {
 
  };



  const cells = Array.from({ length: total }, (_, i) => (
    <SingleSquare key={i} shape={shape}
    //  color={cellColors[i] || 'transparent'} 
     size={size} onClick={() => handleCellClick(i)} />
  ));

  return (
    <div  >
      {cells} 
    </div>
  );
}

export default Grid;
