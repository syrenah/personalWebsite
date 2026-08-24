import React from 'react';
import { BLACK } from '../../config/contants';

function SingleSquare({
  shape = 'square',
  color = BLACK,
  size = 24,
  className = '',
  style = {},
  onClick,
}) {
  const normalized = (shape || '').toLowerCase();
  const sizePx = `${size}px`;
  const borderWidth = Math.max(1, Math.round(size / 6));


  let computedStyle = {};
  const chosencolor = color;

  if (normalized === 'circle') {
    computedStyle = {     
       width: sizePx,
       height: sizePx, 
       backgroundColor: color, 
       borderRadius: '50%' };
  } else if (normalized === 'hole') {
    // Render a ring (donut) using a border so the center remains hollow
    computedStyle = {
       width: sizePx,
       height: sizePx,
       boxSizing: 'border-box',
       border: `${borderWidth}px solid ${chosencolor}`,
       borderRadius: '50%',
       backgroundColor: 'transparent',
    };
  } else {
    //  'square'
    computedStyle = {   
      border:'pink',  
       width: sizePx,
       height: sizePx, 
       backgroundColor: chosencolor };
  }


  const clickableStyle = { cursor: onClick ? 'pointer' : 'default' };

  return (
    <div
      onClick={onClick}
      className={className}
      style={{ ...computedStyle, ...style, ...clickableStyle }}
    />
  );
}

export default SingleSquare;
