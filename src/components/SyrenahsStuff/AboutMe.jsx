import React, { useEffect, useState } from 'react';
import Tile from '../reusableComponents/Tile';
import tiles from './tiles.json';

import { Stack } from '@mui/material';

function AboutMe() {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width >= 1536) setCols(4);
      else if (width >= 1200) setCols(3);
      else if (width >= 900) setCols(2);
      else if (width >= 600) setCols(1);
      else setCols(1);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const cells = tiles.map((tile, index) => (
    <Tile
      key={index}
      title={tile.title}
      subtitle={tile.subtitle}
      image={tile.image}
      link={tile.link}
    />
  ));

  const rows = [];

  for (let i = 0; i < cells.length; i += cols) {
    rows.push(
      <Stack
        key={i}
        direction="row"
        sx={{
          width: '100%',
        }}
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
    <Stack sx={{ width: '100%' }}>
      {rows}
    </Stack>
  );
}

export default AboutMe;