import React from 'react';

interface AlWildanLogoProps {
  className?: string;
  size?: number;
  customUrl?: string;
}

export function AlWildanLogo({ className = '', size = 150, customUrl }: AlWildanLogoProps) {
  const imageUrl = customUrl || localStorage.getItem('tahfizh_custom_logo') || "https://lh3.googleusercontent.com/d/1ZViH5e-ooEl4MW1MxrSF0Qu6jdfHlYw0";
  
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <img
        src={imageUrl}
        alt="Al-Wildan Logo"
        className="w-full h-full object-contain select-none"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
