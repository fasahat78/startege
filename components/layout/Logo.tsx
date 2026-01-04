"use client";

import { useState, useEffect } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({ width = 120, height = 32, className = "", priority = false }: LogoProps) {
  const [imgSrc, setImgSrc] = useState("/images/Startege.svg");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Reset error state when component mounts
    setImgError(false);
  }, []);

  return (
    <div className={`relative flex items-center justify-start ${className}`} style={{ height, width: 'auto' }}>
      {!imgError ? (
        <img
          src={imgSrc}
          alt="Startege Logo"
          className="object-contain h-full w-auto"
          style={{ display: 'block', margin: 0, padding: 0 }}
          onError={() => {
            // Fallback chain: SVG -> PNG -> root SVG -> root PNG
            if (imgSrc.includes('/images/Startege.svg')) {
              setImgSrc('/images/Startege.png');
            } else if (imgSrc.includes('/images/Startege.png')) {
              setImgSrc('/logo.svg');
            } else if (imgSrc.includes('/logo.svg')) {
              setImgSrc('/logo.png');
            } else {
              setImgError(true);
            }
          }}
          onLoad={() => {
            // Image loaded successfully
            setImgError(false);
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-accent/10 rounded">
          <span className="text-accent font-bold text-sm">S</span>
        </div>
      )}
    </div>
  );
}

