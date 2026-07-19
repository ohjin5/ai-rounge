export interface PastelTheme {
  key: string;
  bg: string;
  border: string;
  borderColor: string;
  text: string;
  subtext: string;
  tag: string;
  glow: string;
  glowNew: string;
  companionColor: string;
}

export const googlePastelThemes: PastelTheme[] = [
  {
    key: 'blue',
    bg: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.98) 0%, rgba(225, 242, 255, 0.92) 40%, rgba(168, 216, 255, 0.75) 80%, rgba(168, 216, 255, 0.88) 100%)',
    border: 'border-[#A8D8FF]/80',
    borderColor: '#A8D8FF',
    text: 'text-[#102A43]', // High contrast dark slate blue
    subtext: 'text-[#334E68]',
    tag: 'bg-[#A8D8FF]/30 text-[#102A43] border-[#A8D8FF]/40',
    glow: 'rgba(168, 216, 255, 0.5)',
    glowNew: 'rgba(168, 216, 255, 0.9)',
    companionColor: '#A8D8FF'
  },
  {
    key: 'red',
    bg: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 228, 230, 0.92) 40%, rgba(255, 179, 184, 0.75) 80%, rgba(255, 179, 184, 0.88) 100%)',
    border: 'border-[#FFB3B8]/80',
    borderColor: '#FFB3B8',
    text: 'text-[#610B10]', // High contrast dark maroon
    subtext: 'text-[#822025]',
    tag: 'bg-[#FFB3B8]/30 text-[#610B10] border-[#FFB3B8]/40',
    glow: 'rgba(255, 179, 184, 0.5)',
    glowNew: 'rgba(255, 179, 184, 0.9)',
    companionColor: '#FFB3B8'
  },
  {
    key: 'yellow',
    bg: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 250, 220, 0.92) 40%, rgba(255, 230, 154, 0.75) 80%, rgba(255, 230, 154, 0.88) 100%)',
    border: 'border-[#FFE69A]/80',
    borderColor: '#FFE69A',
    text: 'text-[#513C06]', // High contrast dark bronze/brown
    subtext: 'text-[#745B13]',
    tag: 'bg-[#FFE69A]/30 text-[#513C06] border-[#FFE69A]/40',
    glow: 'rgba(255, 230, 154, 0.5)',
    glowNew: 'rgba(255, 230, 154, 0.9)',
    companionColor: '#FFE69A'
  },
  {
    key: 'green',
    bg: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.98) 0%, rgba(232, 250, 230, 0.92) 40%, rgba(190, 231, 184, 0.75) 80%, rgba(190, 231, 184, 0.88) 100%)',
    border: 'border-[#BEE7B8]/80',
    borderColor: '#BEE7B8',
    text: 'text-[#0B3B0E]', // High contrast dark forest green
    subtext: 'text-[#205C24]',
    tag: 'bg-[#BEE7B8]/30 text-[#0B3B0E] border-[#BEE7B8]/40',
    glow: 'rgba(190, 231, 184, 0.5)',
    glowNew: 'rgba(190, 231, 184, 0.9)',
    companionColor: '#BEE7B8'
  }
];

export function getPastelThemeIndex(ideaId: string): number {
  if (!ideaId) return 0;
  let hash = 0;
  for (let i = 0; i < ideaId.length; i++) {
    hash = ideaId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 4;
}

export function getPastelThemeForIdea(ideaId: string): PastelTheme {
  const index = getPastelThemeIndex(ideaId);
  return googlePastelThemes[index];
}
