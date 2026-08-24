import React from 'react';
import Tile from '../reusableComponents/Tile';
import tiles from './tiles.json';

import { Stack } from '@mui/material';
function AboutMe() {

const cols=2

const cells = tiles.map((tile, index) => (
    // <div  >
        <Tile
          key={index}
          title={tile.title}
          subtitle={tile.subtitle}
          image={tile.image}
          link={tile.link}
        />

        // </div>
      ))

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
      <Stack >
    
        {rows2}
     </Stack>
    );




}

export default AboutMe;
