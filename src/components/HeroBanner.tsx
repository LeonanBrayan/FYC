import React from 'react';
import { Play, Terminal, ArrowRight, ShieldCheck, Smartphone, Award, Code2 } from 'lucide-react';

interface HeroBannerProps {
  onStartCourse: () => void;
  onOpenPlayground: () => void;
  completedCount: number;
  totalCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onStartCourse,
  onOpenPlayground,
  completedCount,
  totalCount
}) => {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(rgba(48,28,194,0.948),rgba(29,17,122,0.87),rgba(36,6,48,0.87))] text-white select-none">
      
      {/* Central Iconic Neon Cyan </> Logo (Authentic to Screenshot 2) */}
      <div className="py-10 sm:py-14 md:py-16 px-4 flex flex-col items-center justify-center text-center">
        
        {/* The Authentic 3D Neon Cyan </> SVG Logo */}
        <div className="relative transform hover:scale-[1.02] transition-transform duration-300">
          <svg
            viewBox="0 0 320 160"
            className="w-60 sm:w-72 md:w-88 h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.65)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Black drop-shadow backing for 3D effect */}
            <path
              d="M100 35 L30 80 L100 125"
              stroke="#070312"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M185 20 L135 140"
              stroke="#070312"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M220 35 L290 80 L220 125"
              stroke="#070312"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Vibrant Neon Cyan Strokes */}
            <path
              d="M100 35 L30 80 L100 125"
              stroke="#00ffff"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M185 20 L135 140"
              stroke="#00ffff"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M220 35 L290 80 L220 125"
              stroke="#00ffff"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

      </div>

    </section>
  );
};
