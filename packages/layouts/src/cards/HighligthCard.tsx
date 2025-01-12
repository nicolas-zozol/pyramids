import React from 'react';

interface HighlightableCardProps {
  title: string;
  content: string | React.ReactNode;
  highlight?: boolean; // Toggle highlight
  highlightClass?: string; // Custom highlight Tailwind class
  highlightText: string; // Custom highlight text
}

export const HighlightableCard: React.FC<HighlightableCardProps> = ({
  title,
  content,
  highlight = false,
  highlightClass = 'bg-yellow-100', // Default highlight class
  highlightText,
}) => (
  <div
    className={` relative shadow-md p-4 rounded-lg h-full ${
      highlight ? `${highlightClass} bg-white` : 'bg-white'
    }`}
  >
    {highlight && (
      <div className="absolute badge badge-primary text-white right-4">
        {highlightText}
      </div>
    )}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <div className="text-gray-700">{content}</div>
  </div>
);
