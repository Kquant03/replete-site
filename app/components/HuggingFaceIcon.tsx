import React from 'react';

const HuggingFaceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 120 120"
    fill="currentColor"
    {...props}
  >
    <path d="M60 0C26.9 0 0 26.9 0 60s26.9 60 60 60 60-26.9 60-60S93.1 0 60 0zm-16 84c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12zm32 0c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12zm24-31.5c0 4.4-2.5 8.1-6.2 10.4-4.4 2.7-11.1 4.1-17.8 4.1s-13.4-1.4-17.8-4.1c-3.7-2.3-6.2-6-6.2-10.4 0-7.2 10.7-13 24-13s24 5.8 24 13z"/>
  </svg>
);

export default HuggingFaceIcon;