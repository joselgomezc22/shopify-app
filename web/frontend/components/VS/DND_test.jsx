import React, { useState } from 'react';
import GridLayout from 'react-grid-layout';

const DragAndDropTest = () => {
  const [gridItems, setGridItems] = useState([
    { id: 1, content: 'Item 1', x: 0, y: 0, w: 1, h: 1 },
    { id: 2, content: 'Item 2', x: 1, y: 0, w: 1, h: 1 },
    { id: 3, content: 'Item 3', x: 2, y: 0, w: 1, h: 1 },
    { id: 4, content: 'Item 4', x: 3, y: 0, w: 1, h: 1 },
    { id: 5, content: 'Item 5', x: 4, y: 0, w: 1, h: 1 },
  ]);

  const [selectedItems, setSelectedItems] = useState([]);

  const handleDragStart = (event, layoutItem) => {
    setSelectedItems([layoutItem.i]);
  };

  const handleDrag = (event, layoutItem) => {
    const newGridItems = gridItems.map((gridItem) => {
      if (selectedItems.includes(gridItem.id)) {
        return {
          ...gridItem,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        };
      }
      return gridItem;
    });
    setGridItems(newGridItems);
  };

  const handleDragStop = (event, layoutItem) => {
    setSelectedItems([]);
  };

  return (
    <GridLayout
      className="layout"
      cols={12}
      rowHeight={30}
      width={1200}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
    >
      {gridItems.map((gridItem) => (
        <div
          key={gridItem.id}
          data-grid={{ x: gridItem.x, y: gridItem.y, w: gridItem.w, h: gridItem.h }}
        >
          {gridItem.content}
        </div>
      ))}
    </GridLayout>
  );
};

export default DragAndDropTest;
