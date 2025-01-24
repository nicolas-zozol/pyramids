import React from 'react';
import { FaPhone } from 'react-icons/fa';

interface LinkedInCtaProps {
  center: boolean;
}

export const FatCta: React.FC<LinkedInCtaProps> = ({ center }) => {
  return (
    <a
      href="https://www.linkedin.com/in/robustacode/"
      target="_blank"
      rel="noopener noreferrer"
      className={`flex justify-center items-center max-w-[600px] w-full px-16 py-5 bg-[#0a66c2] text-white text-xl font-bold rounded-xl shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg ${center ? 'mx-auto' : 'mx-0'}`}
    >
      <FaPhone className="mr-2" />
      Contact me on LinkedIn
    </a>
  );
};
