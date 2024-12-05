import React, { FC } from 'react';

interface Props {
  small?: boolean;
  size?: number; // Multiplier for padding
  block?: boolean;
}

export const EmptyLine: FC<Props> = ({
  small = false,
  size = 1,
  block = false,
}) => {
  const basePadding = small ? 10 : 20; // Base padding in px
  const paddingMultiplier = size || 1; // Apply size multiplier
  const paddingInRem = (basePadding * paddingMultiplier) / 16; // Convert px to rem for Tailwind

  return (
    <div
      className={`${block ? 'block' : 'inline-block'}`}
      style={{ paddingTop: `${paddingInRem}rem` }}
    />
  );
};
