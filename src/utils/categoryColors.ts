export interface CategoryStyle {
  name: string;
  bgClass: string;          // Tailwind background color
  borderClass: string;      // Tailwind border color
  textClass: string;        // Tailwind text color
  badgeBgClass: string;     // Tailwind badge background
  badgeTextClass: string;   // Tailwind badge text
  glowClass: string;        // For highlights/glow effects
}

export function getCategoryStyle(category: string): CategoryStyle {
  const normalized = (category || '').trim().toLowerCase();

  // Substring checks in priority order
  if (normalized.includes('진료지원')) {
    return {
      name: '진료지원',
      bgClass: 'bg-cyan-50/70 dark:bg-cyan-950/20 backdrop-blur-md',
      borderClass: 'border-cyan-200/60 dark:border-cyan-800/50',
      textClass: 'text-cyan-900 dark:text-cyan-200',
      badgeBgClass: 'bg-cyan-100 dark:bg-cyan-900/60',
      badgeTextClass: 'text-cyan-800 dark:text-cyan-300',
      glowClass: 'shadow-[0_0_15px_rgba(34,211,238,0.25)]',
    };
  }
  if (normalized.includes('진료')) {
    return {
      name: '진료',
      bgClass: 'bg-sky-50/70 dark:bg-sky-950/20 backdrop-blur-md',
      borderClass: 'border-sky-200/60 dark:border-sky-800/50',
      textClass: 'text-sky-900 dark:text-sky-200',
      badgeBgClass: 'bg-sky-100 dark:bg-sky-900/60',
      badgeTextClass: 'text-sky-800 dark:text-sky-300',
      glowClass: 'shadow-[0_0_15px_rgba(56,189,248,0.25)]',
    };
  }
  if (normalized.includes('간호')) {
    return {
      name: '간호',
      bgClass: 'bg-emerald-50/70 dark:bg-emerald-950/20 backdrop-blur-md',
      borderClass: 'border-emerald-200/60 dark:border-emerald-800/50',
      textClass: 'text-emerald-900 dark:text-emerald-200',
      badgeBgClass: 'bg-emerald-100 dark:bg-emerald-900/60',
      badgeTextClass: 'text-emerald-800 dark:text-emerald-300',
      glowClass: 'shadow-[0_0_15px_rgba(52,211,153,0.25)]',
    };
  }
  if (normalized.includes('행정')) {
    return {
      name: '행정',
      bgClass: 'bg-purple-50/70 dark:bg-purple-950/20 backdrop-blur-md',
      borderClass: 'border-purple-200/60 dark:border-purple-800/50',
      textClass: 'text-purple-900 dark:text-purple-200',
      badgeBgClass: 'bg-purple-100 dark:bg-purple-900/60',
      badgeTextClass: 'text-purple-800 dark:text-purple-300',
      glowClass: 'shadow-[0_0_15px_rgba(192,132,252,0.25)]',
    };
  }
  if (normalized.includes('연구')) {
    return {
      name: '연구',
      bgClass: 'bg-rose-50/70 dark:bg-rose-950/20 backdrop-blur-md',
      borderClass: 'border-rose-200/60 dark:border-rose-800/50',
      textClass: 'text-rose-900 dark:text-rose-200',
      badgeBgClass: 'bg-rose-100 dark:bg-rose-900/60',
      badgeTextClass: 'text-rose-800 dark:text-rose-300',
      glowClass: 'shadow-[0_0_15px_rgba(251,113,133,0.25)]',
    };
  }
  if (normalized.includes('환자') || normalized.includes('서비스')) {
    return {
      name: '환자서비스',
      bgClass: 'bg-amber-50/70 dark:bg-amber-950/20 backdrop-blur-md',
      borderClass: 'border-amber-200/60 dark:border-amber-800/50',
      textClass: 'text-amber-900 dark:text-amber-200',
      badgeBgClass: 'bg-amber-100 dark:bg-amber-900/60',
      badgeTextClass: 'text-amber-800 dark:text-amber-300',
      glowClass: 'shadow-[0_0_15px_rgba(251,191,36,0.25)]',
    };
  }
  if (normalized.includes('정보기술') || normalized.includes('it') || normalized.includes('tech')) {
    return {
      name: '정보기술',
      bgClass: 'bg-blue-50/70 dark:bg-blue-950/20 backdrop-blur-md',
      borderClass: 'border-blue-200/60 dark:border-blue-800/50',
      textClass: 'text-blue-900 dark:text-blue-200',
      badgeBgClass: 'bg-blue-100 dark:bg-blue-900/60',
      badgeTextClass: 'text-blue-800 dark:text-blue-300',
      glowClass: 'shadow-[0_0_15px_rgba(96,165,250,0.25)]',
    };
  }
  if (normalized.includes('보안')) {
    return {
      name: '보안',
      bgClass: 'bg-slate-50/70 dark:bg-slate-950/20 backdrop-blur-md',
      borderClass: 'border-slate-200/60 dark:border-slate-800/50',
      textClass: 'text-slate-900 dark:text-slate-200',
      badgeBgClass: 'bg-slate-100 dark:bg-slate-900/60',
      badgeTextClass: 'text-slate-800 dark:text-slate-300',
      glowClass: 'shadow-[0_0_15px_rgba(148,163,184,0.25)]',
    };
  }

  // Fallback to "기타"
  return {
    name: '기타',
    bgClass: 'bg-gray-50/70 dark:bg-gray-950/20 backdrop-blur-md',
    borderClass: 'border-gray-200/60 dark:border-gray-800/50',
    textClass: 'text-gray-900 dark:text-gray-200',
    badgeBgClass: 'bg-gray-100 dark:bg-gray-900/60',
    badgeTextClass: 'text-gray-800 dark:text-gray-300',
    glowClass: 'shadow-[0_0_15px_rgba(156,163,175,0.25)]',
  };
}
