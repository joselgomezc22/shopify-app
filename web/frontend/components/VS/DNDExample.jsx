import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";

const DNDExample = () => {
  const [gridItems, setGridItems] = useState([
    { id: 1, content: "Item 1" },
    { id: 2, content: "Item 2" },
    { id: 3, content: "Item 3" },
    { id: 4, content: "Item 4" },
  ]);

  const moveItem = (id, atIndex) => {
    const item = gridItems.find((i) => i.id === id);
    const newGridItems = gridItems.filter((i) => i.id !== id);

    newGridItems.splice(atIndex, 0, item);

    setGridItems(newGridItems);
  };

  const [, drag] = useDrag({
    item: { type: "grid-item" },
  });

  const [, drop] = useDrop({
    accept: "grid-item",
    hover(item, monitor) {
      const draggedId = item.id;
      const targetIndex = gridItems.findIndex((i) => i.id === draggedId);
      const targetSize = monitor.getClientOffset();
      const targetCenter = targetSize.x / 2;

      const draggedOffset = monitor.getClientOffset();
      const draggedTop = draggedOffset.y;

      if (draggedIndex < targetIndex && draggedTop < targetCenter) {
        return;
      }

      if (draggedIndex > targetIndex && draggedTop > targetCenter) {
        return;
      }

      moveItem(draggedId, targetIndex);
    },
  });

  return (
    <div className="grid">
      {gridItems.map((item, index) => (
        <div
          ref={(node) => drag(drop(node))}
          key={item.id}
          className="grid-item"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

export default DNDExample;
