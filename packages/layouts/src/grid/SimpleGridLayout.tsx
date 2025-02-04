import React, { FC, ReactNode } from 'react';

interface GridLayoutProps {
  items: ReactNode[];
  itemMaximumWidth?: number; // Maximum width in pixels
  gap?: number; // Tailwind spacing classes, e.g., 'gap-4'
}

export const SimpleGridLayout: FC<GridLayoutProps> = ({
  items,
  itemMaximumWidth = 350,
  gap = 4,
}) => {
  return (
    <div
      className={`grid gap-${gap} justify-items-center`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${itemMaximumWidth}px, 1fr))`,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            maxWidth: itemMaximumWidth,
            width: '100%', // Ensures items stretch to their maximum width
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};
