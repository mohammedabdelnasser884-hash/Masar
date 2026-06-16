import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon-only" | "full" | "light-bg" | "dark-bg";
  language?: "ar" | "en";
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  variant = "full",
  language = "ar"
}) => {
  const isRtl = language === "ar";

  // Slightly scaled up size definitions for maximum visual clarity
  const iconSizes = {
    sm: "w-9 h-9 sm:w-10 h-10",
    md: "w-11 h-11 sm:w-12 h-12",
    lg: "w-14 h-14 sm:w-16 h-16"
  };

  const textSizes = {
    sm: "text-sm sm:text-base font-black tracking-tight",
    md: "text-lg sm:text-xl font-black tracking-tight",
    lg: "text-2xl sm:text-3xl font-black tracking-tight"
  };

  const subtitleSizes = {
    sm: "text-[9.5px] sm:text-[10px]",
    md: "text-[10.5px] sm:text-[11px]",
    lg: "text-xs sm:text-sm"
  };

  // Custom SVG path representing "M" (for Masar) combined with an ascending professional trajectory curves.
  const svgIcon = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizes[size]} transition-all duration-300 drop-shadow-sm shrink-0`}
    >
      <defs>
        <linearGradient id="masarGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo 600 */}
          <stop offset="50%" stopColor="#6366F1" /> {/* Indigo 500 */}
          <stop offset="100%" stopColor="#10B981" /> {/* Emerald 500 */}
        </linearGradient>
        <linearGradient id="dotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Decorative ambient backdrop */}
      <circle cx="50" cy="50" r="44" fill="#EEF2FF" className="opacity-70 animate-pulse" />

      {/* Trajectory line mapping 'Meem' and 'M' soaring high */}
      <path
        d="M26 65 
           C26 65, 34 38, 48 38 
           C60 38, 64 52, 52 64 
           C42 74, 34 60, 48 48 
           C60 36, 74 28, 80 26"
        stroke="url(#masarGradient)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Trajectory Arrow Tip */}
      <path
        d="M66 24 H82 V40"
        stroke="url(#masarGradient)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Target pinpoint node */}
      <circle cx="48" cy="51" r="5" fill="url(#dotGradient)" />
    </svg>
  );

  if (variant === "icon-only") {
    return <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>{svgIcon}</div>;
  }

  return (
    <div 
      className={`inline-flex items-center gap-3 w-fit max-w-full select-none flex-nowrap ${className}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Visual Icon with soft pulsing backglow */}
      <div className="shrink-0 relative group">
        <div className="absolute inset-0 bg-indigo-500/15 rounded-2xl blur-md group-hover:bg-indigo-500/25 transition-all duration-300 pointer-events-none" />
        <div className="relative transform group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
          {svgIcon}
        </div>
      </div>

      {/* Bilingual Brand and Identity Text */}
      <div className="flex flex-col justify-center shrink text-start">
        <span 
          className={`${textSizes[size]} font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent leading-none align-middle`}
        >
          {isRtl ? "مَسَار" : "Masar"}
        </span>
        <span 
          className={`${subtitleSizes[size]} text-slate-400 font-bold tracking-wide leading-none pt-1.5 whitespace-nowrap`}
        >
          {isRtl ? "رسمُ مسارك المهني الموثوق" : "Your Trusted Career Co-pilot"}
        </span>
      </div>
    </div>
  );
};
