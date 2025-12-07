import React from "react";

const ExcelIcon = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="3" width="20" height="18" rx="2" fill="#1D6F42" />
    <rect x="4" y="5" width="16" height="14" rx="1" fill="#fff" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1D6F42">XLS</text>
  </svg>
);

export default ExcelIcon;
