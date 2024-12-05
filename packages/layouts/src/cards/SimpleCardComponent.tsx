import React from 'react';

interface SimpleCardProps {
  title: string;
  content: string | React.ReactNode;
}

export const SimpleCardComponent: React.FC<SimpleCardProps> = ({
  title,
  content,
}) => (
  <div className="bg-white shadow-md p-4 rounded-lg h-full">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <div className="text-gray-700">{content}</div>
  </div>
);
