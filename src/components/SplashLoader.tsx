import React from "react";
import EyeLogo from "./EyeLogo";

interface SplashLoaderProps {
  text?: string;
}

export default function SplashLoader({ text = "Loading..." }: SplashLoaderProps) {
  return (
    <div className="splash-loader-overlay">
      <EyeLogo className="splash-loader-eye" width={72} height={72} animated={true} />
      <div className="splash-loader-text">{text}</div>
    </div>
  );
}
