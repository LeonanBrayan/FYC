import React from 'react';

interface CourseLogoProps {
  type: 'python' | 'html5' | 'css3' | 'php' | string;
  className?: string;
}

export const CourseLogo: React.FC<CourseLogoProps> = ({ type, className = "w-24 h-24" }) => {
  if (type === 'python') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {/* Imagem do Python com fundo 100% transparente */}
        <img 
          src="/assets/images/python.png" 
          alt="Curso de Python" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (type === 'html5') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top "HTML" wordmark */}
          <text x="60" y="22" textAnchor="middle" fill="#0f172a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="1">
            HTML
          </text>
          
          {/* Shield Outer */}
          <path d="M26 30 L32.5 102 L60 110 L87.5 102 L94 30 Z" fill="#e44d26" />
          
          {/* Shield Right Half (Light/Shadow effect) */}
          <path d="M60 35 L60 104.5 L82.5 98 L88 35 Z" fill="#f16529" />
          
          {/* White '5' Shape (Left side) */}
          <path d="M60 46 L38 46 L39 57 L60 57 L60 68 L40 68 L40.5 73.5 L41.5 85 L60 90 L60 79 L49 76 L48.5 71 L60 71 Z" fill="#ebebeb" />
          
          {/* White '5' Shape (Right side) */}
          <path d="M60 46 L82 46 L81 57 L60 57 L60 68 L79.5 68 L78 85 L60 90 L60 79 L71 76 L71.5 71 L60 71 Z" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  if (type === 'css3') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top "CSS" wordmark */}
          <text x="60" y="22" textAnchor="middle" fill="#0f172a" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="1">
            CSS
          </text>
          
          {/* Shield Outer */}
          <path d="M26 30 L32.5 102 L60 110 L87.5 102 L94 30 Z" fill="#1572b6" />
          
          {/* Shield Right Half (Light/Shadow effect) */}
          <path d="M60 35 L60 104.5 L82.5 98 L88 35 Z" fill="#33a9dc" />
          
          {/* White '3' Shape (Left side) */}
          <path d="M60 46 L38 46 L39 57 L60 57 L60 68 L49 68 L49.5 73.5 L60 73.5 L60 85 L60 90 L41.5 85 L40.5 74 L49.5 74 L49 68 Z" fill="#ebebeb" />
          
          {/* White '3' Shape (Right side) */}
          <path d="M60 46 L82 46 L80.5 63 L69 63 L69 57 L60 57 L60 68 L70 68 L70 73.5 L60 73.5 L60 85 L78 85 L79.5 68 L60 68 Z" fill="#ffffff" />
          
          {/* 3 Detail fix */}
          <path d="M60 46 L82 46 L81 57 L60 57 Z M60 64 L79.5 64 L78 85 L60 90 L60 79 L71 76 L71.5 70 L60 70 Z" fill="#ffffff" />
          <path d="M60 46 L38 46 L39 57 L60 57 Z M60 70 L48 70 L48.5 75 L60 78.5 Z" fill="#ebebeb" />
        </svg>
      </div>
    );
  }

  if (type === 'php') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 140 120" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* PHP ElePHPant Body */}
          <g transform="translate(10, 15)">
            {/* Elephant Silhouette */}
            <path
              d="M32 20 C48 10, 80 10, 95 24 C104 32, 108 45, 108 60 C108 68, 104 74, 98 78 L98 88 C98 90, 94 92, 90 92 L82 92 C78 92, 76 89, 76 85 L76 78 C70 78, 64 78, 58 78 L58 85 C58 89, 56 92, 52 92 L44 92 C40 92, 38 89, 38 85 L38 78 C30 78, 22 75, 16 68 C8 58, 6 42, 10 32 C14 22, 22 18, 32 20 Z"
              fill="#8892be"
              stroke="#4f5b93"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            
            {/* Trunk */}
            <path
              d="M16 48 C10 48, 4 54, 4 64 C4 72, 8 76, 14 74 C16 73, 17 70, 16 66 C15 62, 18 56, 24 56"
              fill="#8892be"
              stroke="#4f5b93"
              strokeWidth="3"
            />
            
            {/* Elephant Ear */}
            <path
              d="M40 22 C30 24, 22 36, 22 48 C22 60, 30 68, 40 68 C44 68, 46 62, 46 54 C46 38, 45 25, 40 22 Z"
              fill="#777bb4"
              stroke="#4f5b93"
              strokeWidth="2.5"
            />

            {/* Elephant Eye */}
            <circle cx="28" cy="34" r="3.5" fill="#ffffff" />
            <circle cx="27" cy="34" r="2" fill="#1e293b" />
            <circle cx="26" cy="33" r="0.7" fill="#ffffff" />

            {/* Tail */}
            <path
              d="M98 52 C108 50, 114 42, 112 36 C110 32, 106 32, 104 36 C102 40, 104 44, 98 48"
              stroke="#4f5b93"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* "php" stylized letters in elephant */}
            <g transform="translate(42, 34)">
              <text
                x="26"
                y="24"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
                fontSize="22"
                letterSpacing="-1"
                stroke="#4f5b93"
                strokeWidth="1.5"
                paintOrder="stroke fill"
              >
                php
              </text>
            </g>
          </g>
        </svg>
      </div>
    );
  }

  return null;
};
