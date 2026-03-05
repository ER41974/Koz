/* eslint-disable i18next/no-literal-string */
import React from "react";

const KozTextLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 300 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="kozGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="#F9C5E8" />
        </linearGradient>
      </defs>
      <text
        x="150"
        y="72"
        textAnchor="middle"
        fill="url(#kozGradient)"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="72"
        fontWeight="800"
        letterSpacing="8"
      >
        Koz
      </text>
    </svg>
  );
};

export default KozTextLogo;
