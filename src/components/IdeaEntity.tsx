import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Idea } from '../types/idea';
import { VisualConfig } from '../utils/ideaVisualMapper';
import { getPastelThemeForIdea } from '../utils/pastelColors';

interface IdeaEntityProps {
  key?: string | number;
  idea: Idea;
  config: VisualConfig;
  x: number;
  y: number;
  size: number; // Dynamic diameter in pixels
  isNewlyAdded: boolean;
  isFocused: boolean;
  onClick: () => void;
}

export default function IdeaEntity({ idea, config, x, y, size, isNewlyAdded, isFocused, onClick }: IdeaEntityProps) {
  const [isHovered, setIsHovered] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Assign the stable Google pastel theme based on idea ID
  const theme = getPastelThemeForIdea(idea.id);

  // Abbreviated title helper for tiny background bubbles
  const getAbbreviatedTitle = (titleStr: string) => {
    if (titleStr.length <= 11) return titleStr;
    return titleStr.slice(0, 10) + '...';
  };

  const renderCreatureSVG = () => {
    const color = theme.companionColor;
    const speed = config.ambientSpeed || 1.0;

    switch (config.type) {
      case 'fish':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              <radialGradient id={`grad-fish-${idea.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="70%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill={`url(#grad-fish-${idea.id})`} opacity="0.15" />
            <g transform="translate(50, 50) scale(0.9)">
              <motion.path
                d="M -15,0 L -35,-12 L -30,0 L -35,12 Z"
                fill={color}
                opacity="0.8"
                animate={{
                  rotate: [-12, 12, -12],
                  scaleY: [0.9, 1.1, 0.9],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2 / speed,
                  ease: "easeInOut",
                }}
              />
              <motion.path
                d="M -2,-8 C -8,-25 -15,-20 -5,-5"
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                animate={{ rotate: [-8, 8, -8] }}
                transition={{ repeat: Infinity, duration: 1.8 / speed, ease: "easeInOut" }}
              />
              <motion.path
                d="M -2,8 C -8,25 -15,20 -5,5"
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                animate={{ rotate: [8, -8, 8] }}
                transition={{ repeat: Infinity, duration: 1.8 / speed, ease: "easeInOut" }}
              />
              <motion.path
                d="M -22,0 C -10,-10 15,-12 30,0 C 15,12 -10,10 -22,0 Z"
                fill={color}
                animate={{
                  scaleY: [0.95, 1.05, 0.95],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5 / speed,
                  ease: "easeInOut",
                }}
              />
              <circle cx="18" cy="-3" r="2.5" fill="#ffffff" />
            </g>
          </svg>
        );

      case 'butterfly':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-butt-${idea.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="60%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <g transform="translate(50, 50) scale(0.95)">
              <path d="M 0,-10 Q -6,-24 -15,-25 M 0,-10 Q 6,-24 15,-25" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <motion.g
                animate={{ scaleX: [1, 0.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 / speed, ease: "easeInOut" }}
                style={{ originX: 0 }}
              >
                <path d="M 0,-6 C -15,-25 -32,-20 -28,-3 C -25,5 -10,3 0,-2 Z" fill={`url(#grad-butt-${idea.id})`} />
                <path d="M 0,-2 C -12,2 -24,-2 -22,10 C -20,18 -8,12 0,2 Z" fill={color} opacity="0.8" />
              </motion.g>
              <motion.g
                animate={{ scaleX: [1, 0.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 / speed, ease: "easeInOut" }}
                style={{ originX: 0 }}
              >
                <path d="M 0,-6 C 15,-25 32,-20 28,-3 C 25,5 10,3 0,-2 Z" fill={`url(#grad-butt-${idea.id})`} />
                <path d="M 0,-2 C 12,2 24,-2 22,10 C 20,18 8,12 0,2 Z" fill={color} opacity="0.8" />
              </motion.g>
              <ellipse cx="0" cy="0" rx="3.5" ry="12" fill="#ffffff" />
              <ellipse cx="0" cy="0" rx="2" ry="10" fill={color} />
            </g>
          </svg>
        );

      case 'paperBird':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <g transform="translate(50, 50) scale(0.9)">
              <motion.g
                animate={{
                  rotateX: [12, -12, 12],
                  y: [-3, 3, -3],
                }}
                transition={{ repeat: Infinity, duration: 2.2 / speed, ease: "easeInOut" }}
              >
                <path d="M -25,2 L 25,-12 L -5,6 Z" fill="#ffffff" opacity="0.9" />
                <path d="M -25,2 L 25,-12 L -8,0 Z" fill={color} opacity="0.65" />
                <motion.path
                  d="M -8,0 L 25,-12 L 0,-28 Z"
                  fill={color}
                  opacity="0.85"
                  animate={{ rotateX: [0, 35, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6 / speed, ease: "easeInOut" }}
                  style={{ originY: "12px", originX: "8px" }}
                />
                <motion.path
                  d="M -5,6 L 25,-12 L 8,24 Z"
                  fill={color}
                  opacity="0.75"
                  animate={{ rotateX: [0, -35, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6 / speed, ease: "easeInOut" }}
                  style={{ originY: "-6px", originX: "5px" }}
                />
              </motion.g>
            </g>
          </svg>
        );

      case 'seed':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              <radialGradient id={`grad-seed-${idea.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="40%" stopColor={color} stopOpacity="0.85" />
                <stop offset="80%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            </defs>
            <g transform="translate(50, 50) scale(0.9)">
              <motion.circle
                cx="0"
                cy="0"
                r="30"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity="0.5"
                animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.5, 0.15, 0.5] }}
                transition={{ repeat: Infinity, duration: 3 / speed, ease: "easeInOut" }}
              />
              <motion.circle
                cx="0"
                cy="0"
                r="20"
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.7"
                animate={{ scale: [1.2, 0.7, 1.2], opacity: [0.25, 0.75, 0.25] }}
                transition={{ repeat: Infinity, duration: 2.5 / speed, ease: "easeInOut" }}
              />
              <motion.path
                d="M 0,-16 C -12,-4 -12,12 0,16 C 12,12 12,-4 0,-16 Z"
                fill={`url(#grad-seed-${idea.id})`}
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  rotate: [0, 45, 0],
                }}
                transition={{ repeat: Infinity, duration: 2.2 / speed, ease: "easeInOut" }}
              />
            </g>
          </svg>
        );

      case 'cube':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <g transform="translate(50, 50) scale(0.85)">
              <motion.g
                animate={{
                  rotateY: [0, 180, 360],
                  rotateX: [15, 30, 15],
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{ repeat: Infinity, duration: 4.5 / speed, ease: "linear" }}
              >
                <path d="M 0,-16 L 16,-8 L 0,0 L -16,-8 Z" fill="#ffffff" opacity="0.85" stroke={color} strokeWidth="1.5" />
                <path d="M -16,-8 L 0,0 L 0,16 L -16,8 Z" fill={color} opacity="0.75" stroke={color} strokeWidth="1.5" />
                <path d="M 0,0 L 16,-8 L 16,8 L 0,16 Z" fill={color} opacity="0.5" stroke={color} strokeWidth="1.5" />
              </motion.g>
            </g>
          </svg>
        );

      case 'star':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              <radialGradient id={`grad-star-${idea.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="35%" stopColor={color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            </defs>
            <g transform="translate(50, 50) scale(0.9)">
              <motion.path
                d="M 0,-24 L 6,-6 L 24,0 L 6,6 L 0,24 L -6,6 L -24,0 L -6,-6 Z"
                fill={`url(#grad-star-${idea.id})`}
                opacity="0.5"
                animate={{
                  scale: [0.8, 1.25, 0.8],
                  rotate: [0, 90, 180, 270, 360],
                }}
                transition={{ repeat: Infinity, duration: 6 / speed, ease: "linear" }}
              />
              <motion.path
                d="M 0,-15 L 4,-4 L 15,0 L 4,4 L 0,15 L -4,4 L -15,0 L -4,-4 Z"
                fill="#ffffff"
                animate={{
                  scale: [1.1, 0.85, 1.1],
                }}
                transition={{ repeat: Infinity, duration: 2 / speed, ease: "easeInOut" }}
              />
            </g>
          </svg>
        );
    }
  };

  // Determine which visual presentation layout to render inside the bubble
  const renderBubbleContent = () => {
    const isTiny = size < 115 && !isFocused;
    const isMedium = size >= 115 && size < 200 && !isFocused;

    if (isTiny) {
      // Tiny bubble structure (Background) - max clean, title, department, like count
      return (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-1.5 overflow-hidden select-none">
          <span 
            className={`font-sans font-extrabold text-center leading-tight transition-all duration-300 ${theme.text}`}
            style={{ 
              fontSize: isHovered ? '9.5px' : '8.5px',
              wordBreak: 'break-all',
              lineHeight: '1.15'
            }}
          >
            {isHovered ? idea.title : getAbbreviatedTitle(idea.title)}
          </span>
          
          <span className={`text-[7.5px] font-medium opacity-85 truncate w-full text-center px-1 ${theme.subtext}`}>
            {idea.department}
          </span>

          <span className="text-[8px] font-bold text-rose-600 dark:text-rose-400 mt-0.5 select-none shrink-0 flex items-center gap-0.5">
            ♥ {idea.like}
          </span>
        </div>
      );
    }

    if (isMedium) {
      // Medium bubble structure (Highlighted) - shows Title, Department, and Like
      return (
        <div className="w-full h-full flex flex-col justify-between items-center text-center p-3 select-none overflow-hidden relative">
          {/* Category Tag */}
          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border border-black/[0.03] scale-90 ${theme.tag}`}>
            {idea.category || '기타'}
          </span>

          {/* Title */}
          <div className="w-full flex-1 flex flex-col items-center justify-center px-1 overflow-hidden my-1">
            <h3 
              className={`font-sans font-bold text-center leading-tight break-all ${theme.text}`}
              style={{
                fontSize: size >= 150 ? '11.5px' : '10px',
                maxHeight: '2.4em',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {idea.title}
            </h3>
            <span className={`text-[8.5px] font-medium opacity-85 mt-0.5 truncate w-full text-center px-1 ${theme.subtext}`}>
              {idea.department}
            </span>
          </div>

          <span className="text-[9px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 select-none shrink-0">
            ♥ {idea.like}
          </span>
        </div>
      );
    }

    // Large/Focus structure - full detailed content: Title, Department, Author, Category, description/problem, and likes
    return (
       <div className="w-full h-full flex flex-col justify-between items-center text-center p-6 select-none overflow-hidden relative">
         {/* Category Tag & NEW Indicator */}
         <div className="w-full flex items-center justify-center gap-2 z-10 shrink-0">
           <span className={`text-[10px] md:text-[11px] font-sans font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-black/[0.03] ${theme.tag}`}>
             {idea.category || '기타'}
           </span>
           {isNewlyAdded && (
             <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
               NEW
             </span>
           )}
           <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-500/15 flex items-center gap-0.5 shadow-sm select-none">
             ♥ {idea.like}
           </span>
         </div>
 
         {/* Title */}
         <div className="w-full flex-1 flex flex-col items-center justify-center px-2 z-10 my-2 overflow-hidden">
           <h3
             className={`${theme.text} font-sans font-black tracking-tight text-center leading-snug break-all`}
             style={{
               fontSize: size >= 330 ? '21px' : size >= 290 ? '18px' : '15px',
               lineHeight: '1.25',
               maxHeight: '3.8em',
               display: '-webkit-box',
               WebkitLineClamp: 3,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden',
             }}
           >
             {idea.title}
           </h3>
 
           {/* A one-liner preview of the description/problem if appropriate */}
           {size >= 280 && (idea.problem || idea.description) && (
             <p 
               className={`mt-2 font-medium line-clamp-2 text-center break-all opacity-85 px-4 ${theme.subtext}`}
               style={{ fontSize: size >= 330 ? '11px' : '10px', lineHeight: '1.3' }}
             >
               {idea.problem || idea.description}
             </p>
           )}
         </div>
 
         {/* Department and Author */}
         <div className="w-full z-10 shrink-0 border-t border-black/5 pt-1.5">
           <p
             className={`${theme.subtext} font-sans font-extrabold text-center truncate px-1`}
             style={{ fontSize: size >= 300 ? '12px' : '10.5px' }}
           >
             {idea.department || '소속 미입력'}
           </p>
           <p
             className={`${theme.subtext} font-sans font-bold text-center opacity-90 truncate px-1 mt-0.5`}
             style={{ fontSize: size >= 300 ? '12px' : '10.5px' }}
           >
             {idea.name || '익명'}
           </p>
         </div>
       </div>
    );
  };

  const isTiny = size < 115 && !isFocused;

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        zIndex: isFocused ? 100 : isHovered ? 50 : 20,
      }}
      initial={isNewlyAdded ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 0.95 }}
      animate={{
        scale: isHovered ? (isTiny ? 1.25 : 1.05) : 1,
        opacity: isFocused ? 1.0 : (isTiny ? 0.78 : 0.96),
      }}
      transition={isNewlyAdded ? { duration: 1.5, ease: "easeOut" } : { duration: 0.4, ease: "easeOut" }}
    >
      <button
        ref={triggerRef}
        id={`entity-${idea.id}`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="w-full h-full relative focus:outline-none rounded-full cursor-pointer group select-none flex items-center justify-center transition-all duration-300"
        aria-label={`아이디어: ${idea.title}, 분야: ${idea.category}`}
      >
        {/* Soap Bubble Body with customized styling */}
        <motion.div
          className={`w-full h-full relative border flex flex-col justify-between items-center text-center select-none overflow-hidden ${theme.border} backdrop-blur-md shadow-lg`}
          style={{
            background: theme.bg,
            boxShadow: isFocused
              ? `inset -12px -12px 24px rgba(255, 255, 255, 0.9), inset 12px 12px 24px rgba(255, 255, 255, 0.35), 0 30px 60px -10px ${isNewlyAdded ? theme.glowNew : theme.glow}, 0 0 45px 8px rgba(255,255,255,0.45)`
              : isHovered
              ? `inset -6px -6px 14px rgba(255, 255, 255, 0.85), inset 6px 6px 14px rgba(255, 255, 255, 0.2), 0 20px 45px -10px ${isNewlyAdded ? theme.glowNew : theme.glow}, 0 0 30px 4px rgba(255,255,255,0.3)`
              : `inset -4px -4px 10px rgba(255, 255, 255, 0.75), inset 4px 4px 10px rgba(255, 255, 255, 0.15), 0 8px 18px -6px rgba(0,0,0,0.12), 0 0 12px 0.5px ${isNewlyAdded ? theme.glowNew : theme.glow}`,
          }}
          animate={{
            borderRadius: isFocused 
              ? [
                  "50% 50% 50% 50% / 50% 50% 50% 50%",
                  "51% 49% 52% 48% / 49% 51% 49% 51%",
                  "49% 51% 48% 52% / 51% 49% 51% 49%",
                  "50% 50% 50% 50% / 50% 50% 50% 50%"
                ]
              : [
                  "48% 52% 50% 50% / 50% 48% 52% 50%",
                  "52% 48% 51% 49% / 48% 52% 48% 52%",
                  "49% 51% 48% 52% / 51% 49% 51% 49%",
                  "48% 52% 50% 50% / 50% 48% 52% 50%"
                ],
          }}
          transition={{
            repeat: Infinity,
            duration: isFocused ? 5 : 6 + (idea.title.length % 3),
            ease: "easeInOut"
          }}
        >
          {/* Subtle rainbow inner sheen overlay to mimic real soap bubble reflection */}
          <div className="absolute inset-0 rounded-full pointer-events-none opacity-[0.22] mix-blend-overlay bg-gradient-to-tr from-cyan-400 via-pink-300 to-yellow-300" />
          
          {/* Render layout-based inner items */}
          {renderBubbleContent()}
        </motion.div>

        {/* Small Elegant Orbiting Companion at Top-Right (Hidden on background bubbles to save clutter) */}
        {!isTiny && (isFocused || size >= 120 || isHovered) && (
          <motion.div
            className="absolute -top-1.5 -right-1.5 w-10 h-10 md:w-11 md:h-11 z-30 pointer-events-none filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)]"
            animate={{
              y: [-3, 3, -3],
              x: [-1, 2, -1],
              scale: isHovered ? 1.18 : 1,
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + (idea.title.length % 3),
              ease: "easeInOut"
            }}
          >
            {renderCreatureSVG()}
          </motion.div>
        )}
      </button>
    </motion.div>
  );
}
