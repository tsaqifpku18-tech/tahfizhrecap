import React from 'react';

interface AlWildanLogoProps {
  className?: string;
  size?: number;
}

export function AlWildanLogo({ className = '', size = 150 }: AlWildanLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none filter drop-shadow-md"
      >
        <defs>
          {/* Subtle gold gradient for the outer border */}
          <linearGradient id="wildan-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="50%" stopColor="#FF8533" />
            <stop offset="100%" stopColor="#FF4D00" />
          </linearGradient>
          
          <linearGradient id="wildan-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0000FF" />
            <stop offset="100%" stopColor="#0000C8" />
          </linearGradient>

          {/* Text paths */}
          {/* Path for upper text: AL-WILDAN */}
          {/* Arcing over the top from left to right */}
          <path
            id="textPath-top"
            d="M 70,250 A 180,180 0 0,1 430,250"
            fill="none"
          />
          
          {/* Path for lower text: INTERNATIONAL ISLAMIC SCHOOL 10 JAKARTA */}
          {/* Arcing along the bottom from left to right, but we reverse it or use side-correct settings */}
          {/* To make bottom text upright and read left-to-right, the path must run from right to left */}
          <path
            id="textPath-bottom"
            d="M 435,250 A 185,185 0 0,1 65,250"
            fill="none"
          />
        </defs>

        {/* Outer Circular Boundary */}
        {/* Deep blue ring with orange borders */}
        <circle
          cx="250"
          cy="250"
          r="240"
          fill="url(#wildan-blue-grad)"
          stroke="url(#wildan-orange-grad)"
          strokeWidth="6"
        />

        {/* Outer Thin Orange Border */}
        <circle
          cx="250"
          cy="250"
          r="244"
          stroke="url(#wildan-orange-grad)"
          strokeWidth="2"
        />

        {/* Curved Texts */}
        {/* Top Text: AL-WILDAN with dots */}
        <text className="font-sans font-black tracking-widest text-[36px]" fill="#39FF14">
          <textPath href="#textPath-top" startOffset="50%" textAnchor="middle">
            • AL-WILDAN •
          </textPath>
        </text>

        {/* Bottom Text: INTERNATIONAL ISLAMIC SCHOOL 10 JAKARTA */}
        <text className="font-sans font-extrabold tracking-wider text-[17px]" fill="#39FF14">
          <textPath href="#textPath-bottom" startOffset="50%" textAnchor="middle">
            INTERNATIONAL ISLAMIC SCHOOL 10 JAKARTA
          </textPath>
        </text>

        {/* Inner Circle (Orange) */}
        <circle
          cx="250"
          cy="250"
          r="145"
          fill="url(#wildan-orange-grad)"
          stroke="url(#wildan-blue-grad)"
          strokeWidth="4"
        />

        {/* Islamic Star (Rub El Hizb) - Two overlapping squares rotated 45deg */}
        <g transform="translate(0, 0)">
          {/* Square 1 */}
          <rect
            x="157"
            y="157"
            width="186"
            height="186"
            fill="#00FF00"
            rx="4"
          />
          {/* Square 2 (Rotated 45 degrees around center 250, 250) */}
          <rect
            x="157"
            y="157"
            width="186"
            height="186"
            fill="#00FF00"
            rx="4"
            transform="rotate(45, 250, 250)"
          />
        </g>

        {/* White Open Book (Al-Quran) in center of Star */}
        <g transform="translate(250, 250) scale(1.15)">
          {/* Shadow/Outline of the Book */}
          <path
            d="M -64,15 C -40,5 -10,18 0,20 C 10,18 40,5 64,15 L 60,-20 C 36,-30 10,-17 0,-15 C -10,-17 -36,-30 -60,-20 Z"
            fill="#047857"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          
          {/* White Pages */}
          <path
            d="M -62,12 C -38,2 -8,15 0,17 C 8,15 38,2 62,12 L 58,-22 C 34,-32 8,-19 0,-17 C -8,-19 -34,-32 -58,-22 Z"
            fill="#FFFFFF"
          />
          
          {/* Book Center Line */}
          <path
            d="M 0,-17 L 0,17"
            stroke="#CBD5E1"
            strokeWidth="2.5"
          />
          
          {/* Decorative page lines */}
          <path d="M -50,-14 C -34,-22 -14,-13 -4,-12" stroke="#E2E8F0" strokeWidth="1.5" />
          <path d="M -52,-6 C -36,-14 -14,-5 -4,-4" stroke="#E2E8F0" strokeWidth="1.5" />
          <path d="M -54,2 C -38,-6 -14,3 -4,4" stroke="#E2E8F0" strokeWidth="1.5" />

          <path d="M 50,-14 C 34,-22 14,-13 4,-12" stroke="#E2E8F0" strokeWidth="1.5" />
          <path d="M 52,-6 C 36,-14 14,-5 4,-4" stroke="#E2E8F0" strokeWidth="1.5" />
          <path d="M 54,2 C 38,-6 14,3 4,4" stroke="#E2E8F0" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
