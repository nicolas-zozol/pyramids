import React from 'react';
import { FatCta } from './FatCta';
import { FaPhone } from 'react-icons/fa';

interface Props {
  className?: string;
  center: boolean;
}
export const FatLinkedIn: React.FC<Props> = ({ className, center }: Props) => {
  return (
    <FatCta center={center} className={className}>
      <span>Contact me on LinkedIn</span> <FaPhone className="ml-2" />
    </FatCta>
  );
};
