import React, { FC } from 'react';

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
  <div className={`flex items-center ${className || ''}`}>
    {label && <span className="mr-2 text-gray-700">{label}</span>}
    <a
      href={`tel:${phoneNumber}`}
      className="text-blue-600 underline font-medium"
    >
      {phoneNumber}
    </a>
  </div>
);
