import React from 'react';
import './Tile.css';

function Tile({ className = '', title, subtitle, children }) {
  return (
    <div className={["tile", className].filter(Boolean).join(' ')}>
      {title && <div className="tile-title">{title}</div>}
      {subtitle && <div className="tile-subtitle">{subtitle}</div>}
      <div className="tile-body">{children}</div>
    </div>
  );
}

export default Tile;
