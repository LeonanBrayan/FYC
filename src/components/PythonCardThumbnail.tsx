import React from 'react';

export const PythonCardThumbnail: React.FC<{ className?: string }> = ({ className = 'w-full h-48' }) => {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#244874] to-[#152943] flex items-center justify-center ${className}`}>
      {/* Background Python code texture */}
      <div className="absolute inset-0 opacity-20 font-mono text-[9px] text-cyan-200 p-3 leading-relaxed select-none pointer-events-none overflow-hidden">
        <div>def dotwrite(ast):</div>
        <div>&nbsp;&nbsp;nodename = getNode(ast)</div>
        <div>&nbsp;&nbsp;label = symbol.sym_name.get(ast[0])</div>
        <div>&nbsp;&nbsp;print("%s [label=" + str(label) + "]")</div>
        <div>&nbsp;&nbsp;if isinstance(ast[1], tuple):</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;for n, child in enumerate(ast[1:]):</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;childname = dotwrite(child)</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print(f"%s -&gt; %s" % (nodename, childname))</div>
      </div>

      {/* Central Python Snake Logo & Text */}
      <div className="relative z-10 flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
        <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top/Blue Snake */}
          <path
            d="M59.5 15 C40 15 41 23 41 23 L41 32 L60 32 L60 35 L33 35 C23 35 15 41 15 57 C15 72 22 78 30 78 L37 78 L37 67 C37 54 47 45 60 45 L78 45 C86 45 92 39 92 31 C92 23 85 15 74 15 L59.5 15 Z"
            fill="url(#blueGrad)"
          />
          {/* Top Snake Eye */}
          <circle cx="48" cy="23" r="3" fill="#ffffff" />

          {/* Bottom/Yellow Snake */}
          <path
            d="M60.5 105 C80 105 79 97 79 97 L79 88 L60 88 L60 85 L87 85 C97 85 105 79 105 63 C105 48 98 42 90 42 L83 42 L83 53 C83 66 73 75 60 75 L42 75 C34 75 28 81 28 89 C28 97 35 105 46 105 L60.5 105 Z"
            fill="url(#yellowGrad)"
          />
          {/* Bottom Snake Eye */}
          <circle cx="72" cy="97" r="3" fill="#2d3748" />

          <defs>
            <linearGradient id="blueGrad" x1="15" y1="15" x2="92" y2="78" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="yellowGrad" x1="105" y1="105" x2="28" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.5" stopColor="#facc15" />
              <stop offset="1" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
        </svg>

        {/* Yellow "python" text below logo */}
        <span className="font-sans font-medium text-xl sm:text-2xl text-[#facc15] tracking-wide mt-1 drop-shadow-md">
          python
        </span>
      </div>
    </div>
  );
};
