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
  const content = (
    <a
    href= {link}
     
  
    
     className={["tile", className].filter(Boolean).join(' ')}>
      {image && (
        <img
          className="tile-image"
          src={image}
          alt={title || ''}
        />
      )}
   
      {title && <div className="tile-title">{title}</div>}
      {subtitle && <div className="tile-subtitle">{subtitle}</div>}

      <div className="tile-body">
        {children}
      </div>
    </a>
  );



  return content;
}

export default Tile;