import React from 'react';

interface TwoColumnProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
}

export const TwoColumn: React.FC<TwoColumnProps> = ({
  leftContent,
  rightContent,
  className = '',
  leftClassName = '',
  rightClassName = '',
}) => {
  return (
    <div className={`flex flex-col lg:flex-row ${className}`}>
      <div className={`w-full lg:w-1/2 p-4 ${leftClassName}`}>
        {leftContent}
      </div>
      <div className={`w-full lg:w-1/2 p-4 ${rightClassName}`}>
        {rightContent}
      </div>
    </div>
  );
};
