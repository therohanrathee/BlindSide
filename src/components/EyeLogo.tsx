import React from "react";

interface EyeLogoProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

export default function EyeLogo({
  className = "",
  width = 24,
  height = 24,
  animated = true,
}: EyeLogoProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        className={animated ? "animate-eye-lid" : ""}
        d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g className={animated ? "animate-eye-lid" : ""}>
        <circle
          className={animated ? "animate-eye-pupil" : ""}
          cx="12"
          cy="12"
          r="3"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
