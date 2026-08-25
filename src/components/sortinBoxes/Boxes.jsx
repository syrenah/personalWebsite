import React from 'react';

function Boxes({
  numbers = [1, 2, 3, 4, 5],
  gap = 10,
  boxSize = 30,
  className = '',
  spanstyle = {},
}) {
  const values = Array.isArray(numbers) ? numbers : [];

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${values.length}, 1fr)`,
        gap: `${gap}px`,
        width: '100%',
        padding:'20px',
         alignItems: 'end',
      }}
    >
      {values.map((number, index) => (
        <span
          key={`${number}-${index}`}
          style={{
            height: `${Math.min(boxSize + number, 150)}px`,
            border: '1px solid black',
            boxSizing: 'border-box',
            textAlign: 'center',
            ...spanstyle
          }}
        >
          {number}
        </span>
      ))}
    </div>
  );
}

export default Boxes;