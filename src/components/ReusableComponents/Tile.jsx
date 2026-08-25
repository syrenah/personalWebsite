import React from 'react';
import './Tile.css';

function Tile({
  className = '',
  title,
  subtitle,
  image,
  link,
  children
}) {
  return (
    <a
      href={link}
      className={['tile', className].filter(Boolean).join(' ')}
      style={{
        backgroundImage: image ? `url("${image}")` : undefined,
      }}
    >
      <div className="tile-content">
        {title && <div className="tile-title">{title}</div>}

        {subtitle && (
          <div className="tile-subtitle">
            {subtitle}
          </div>
        )}

        <div className="tile-body">
          {children}
        </div>
      </div>
    </a>
  );
}

export default Tile;