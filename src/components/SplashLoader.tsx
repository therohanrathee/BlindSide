import React from "react";
import EyeLogo from "./EyeLogo";

interface SplashLoaderProps {
  className?: string;
}

export default function SplashLoader({ className }: SplashLoaderProps) {
  return (
    <div className={`splash-loader-overlay ${className || ""}`}>
      <EyeLogo className="splash-loader-eye" width={72} height={72} animated={true} />
    </div>
  );
}
