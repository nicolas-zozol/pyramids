import React, { FC } from 'react';
import { FiPhone } from 'react-icons/fi';

interface PhoneCTAProps {
  phoneNumber: string; // Phone number to display and call
  label?: string; // Optional label before the phone number, e.g., "Call us at"
  className?: string; // Optional Tailwind classes for styling
}

export const SimplePhoneCTA: FC<PhoneCTAProps> = ({
  phoneNumber,
  label,
  className,
}) => (
  <div className={`flex  items-center ${className || ''}`}>
    {label && (
      <span className="btn btn-primary mr-2 text-gray-700">{label}</span>
    )}
    <a
      href={`tel:${phoneNumber}`}
      className="mt-4 btn btn-primary text-white underline font-medium  "
    >
      <FiPhone />
      {phoneNumber}
    </a>
  </div>
);
