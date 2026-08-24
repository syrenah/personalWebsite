import React, { useEffect, useState } from 'react';

import CommandBuilder from './CommandBuilder';
import Perlergrid from './PerlerPainter/Perlergrid';
import Syrenah from './SyrenahsStuff/Syrenah';
import Boxes from './sortinBoxes/Boxes';

import {
  Tabs,
  Tab,
  Box
} from '@mui/material';

import { styled } from '@mui/material/styles';

import {
  BRAND_BLUE,
  TERMINAL_BG,
  MOCK_OUTPUT
} from '../config/contants';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';


// =========================================================
// Styled Tab
// =========================================================

const CuteTab = styled(Tab)(({ theme }) => ({
  display: 'inline-flex',
  padding: '10px 20px',
  backgroundColor: BRAND_BLUE,
  color: 'white',
  marginTop: '5px',
  fontWeight: 'bold',
  border: '1px solid #ccc',
  minWidth: 'auto',

  '&.Mui-selected': {
    backgroundColor: TERMINAL_BG,
    color: 'white',
  },

  '&:hover': {
    backgroundColor: MOCK_OUTPUT,
    color: 'black',
  },

  borderTopRightRadius: '15px',
  borderTopLeftRadius: '15px',

  cursor: 'pointer',
}));


// =========================================================
// Sortable Tab
// =========================================================

function SortableTab({
  item,
  selected,
  onSelect
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: item.id
  });


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };


  return (

    <CuteTab

      ref={setNodeRef}

      value={item.id}

      selected={selected}

      style={style}

      {...attributes}

      // -----------------------------------------------
      // THIS is what opens the tab
      // -----------------------------------------------

      onClick={() => {
        onSelect(item.id);
      }}

      label={

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >

          {/* -----------------------------------------
              Tab name
          ----------------------------------------- */}

          <Box
            component="span"
            sx={{
              userSelect: 'none',
            }}
          >
            {item.label}
          </Box>


          {/* -----------------------------------------
              Drag handle
          ----------------------------------------- */}

          <Box
            component="span"

            {...listeners}

            onClick={(event) => {
              event.stopPropagation();
            }}

            sx={{
              cursor: isDragging
                ? 'grabbing'
                : 'grab',

              fontSize: '14px',
              lineHeight: 1,

              opacity: 0.6,

              userSelect: 'none',

              '&:hover': {
                opacity: 1,
              },
            }}

            title="Drag to reorder"
          >
            ⋮⋮
          </Box>

        </Box>
      }

    />

  );
}


// =========================================================
// Notebook
// =========================================================

function Notebook() {

  // =======================================================
  // Default tabs
  // =======================================================

  const defaultTabs = [
    {
      id: 'about',
      label: 'About Syrenah',
      component: Syrenah,
    },

    {
      id: 'command',
      label: 'Command Builder',
      component: CommandBuilder,
    },

    {
      id: 'perler',
      label: 'Perler Grid',
      component: Perlergrid,
    },

    {
      id: 'boxes',
      label: 'Sorting Boxes',
      component: Boxes,
    },
  ];


  // =======================================================
  // Load saved order
  // =======================================================

  const [tabs, setTabs] = useState(() => {

    try {

      const saved =
        localStorage.getItem(
          'notebook-tab-order'
        );


      if (!saved) {
        return defaultTabs;
      }


      const savedIds =
        JSON.parse(saved);


      const ordered =
        savedIds
          .map(id =>
            defaultTabs.find(
              item => item.id === id
            )
          )
          .filter(Boolean);


      // Add any tabs that don't exist
      // in the saved configuration yet.

      const missing =
        defaultTabs.filter(
          item =>
            !savedIds.includes(item.id)
        );


      return [
        ...ordered,
        ...missing
      ];

    } catch (error) {

      console.error(
        'Could not load tab order:',
        error
      );

      return defaultTabs;
    }

  });


  // =======================================================
  // Selected tab
  // =======================================================

  const [selectedTab, setSelectedTab] =
    useState('about');


  // =======================================================
  // Save order
  // =======================================================

  useEffect(() => {

    localStorage.setItem(
      'notebook-tab-order',
      JSON.stringify(
        tabs.map(item => item.id)
      )
    );

  }, [tabs]);


  // =======================================================
  // Sensors
  // =======================================================

  const sensors = useSensors(

    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })

  );


  // =======================================================
  // Select tab
  // =======================================================

  const handleSelectTab = (id) => {

    console.log(
      'Opening tab:',
      id
    );

    setSelectedTab(id);

  };


  // =======================================================
  // Drag end
  // =======================================================

  const handleDragEnd = (event) => {

    const {
      active,
      over
    } = event;


    if (!over) {
      return;
    }


    if (active.id === over.id) {
      return;
    }


    setTabs(items => {

      const oldIndex =
        items.findIndex(
          item =>
            item.id === active.id
        );


      const newIndex =
        items.findIndex(
          item =>
            item.id === over.id
        );


      if (
        oldIndex === -1 ||
        newIndex === -1
      ) {
        return items;
      }


      return arrayMove(
        items,
        oldIndex,
        newIndex
      );

    });

  };


  // =======================================================
  // Find selected component
  // =======================================================

  const currentTab =
    tabs.find(
      item =>
        item.id === selectedTab
    );


  const CurrentComponent =
    currentTab?.component;


  // =======================================================
  // Render
  // =======================================================

  return (

    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >

      <SortableContext
        items={tabs.map(item => item.id)}
        strategy={horizontalListSortingStrategy}
      >

        <Box>

          {/* =================================================
              TAB BAR
          ================================================= */}

          <Box sx={{ mb: 1 }}>

            <Tabs
              value={selectedTab}
              aria-label="Notebook tabs"

              TabIndicatorProps={{
                style: {
                  display: 'none',
                },
              }}
            >

              {tabs.map(item => (

                <SortableTab

                  key={item.id}

                  item={item}

                  selected={
                    selectedTab === item.id
                  }

                  onSelect={
                    handleSelectTab
                  }

                />

              ))}

            </Tabs>

          </Box>


          {/* =================================================
              CONTENT
          ================================================= */}

          <Box>

            {CurrentComponent && (
              <CurrentComponent />
            )}

          </Box>

        </Box>

      </SortableContext>

    </DndContext>

  );
}


export default Notebook;