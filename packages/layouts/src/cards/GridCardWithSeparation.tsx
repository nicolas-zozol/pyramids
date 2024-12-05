import React, { FC, ReactNode } from 'react';

interface GridLayoutProps {
  items: ReactNode[];
  gap?: number; // Tailwind spacing classes, e.g., 'gap-4'
}

export const GridCardWithSeparation: FC<GridLayoutProps> = ({ items }) => {
  return (
    <div
      className="grid "
      style={{
        gridTemplateColumns: `repeat( 1fr))`,
      }}
    >
      {items.map((item, index) => (
        <div key={index} className="h-full  p-4">
          {item}
        </div>
      ))}
    </div>
  );
};
