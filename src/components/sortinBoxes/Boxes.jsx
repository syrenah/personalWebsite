import React from 'react';
import SortingVisualizer from './SortingVisualizer';


function Boxes({ numbers = [1, 2, 3, 4, 5] }) {
  return (






    <div style={{ display: 'flex', gap: '10px' }}>
      <SortingVisualizer/>
      {numbers.map((number, index) => (
        <div key={index}>
          {number}
        </div>
      ))}
    </div>
  );
}

export default Boxes;