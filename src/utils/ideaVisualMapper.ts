import { AgentIdea } from '../types/idea';

export type EntityType = 'fish' | 'seed' | 'paperBird' | 'cube' | 'butterfly' | 'star';

export interface VisualConfig {
  type: EntityType;
  color: string;          // Primary accent color (e.g. hex or tailwind class text/glow)
  glowColor: string;      // Glow drop-shadow color filter
  ambientSpeed: number;   // Speed scale for the organic micro-animation (e.g. wings flapping)
  size: number;           // Scale multiplier
  sparkle: boolean;       // Has extra star sparkle particles
}

/**
 * Determines the visual appearance (organism type, neon colors, glow, speeds)
 * of an idea based on its category and semantic keywords in the title and content.
 */
export function getIdeaVisualConfig(idea: AgentIdea, index: number): VisualConfig {
  const category = (idea.category || '').trim().toLowerCase();
  const title = (idea.title || '').toLowerCase();
  const problem = (idea.problem || '').toLowerCase();
  const agentFunc = (idea.agentFunction || '').toLowerCase();
  const text = `${title} ${problem} ${agentFunc}`;

  let type: EntityType = 'star';
  let color = '#38bdf8'; // Default sky-400
  let glowColor = 'rgba(56, 189, 248, 0.4)';
  let ambientSpeed = 1.0;
  let size = 1.0;
  let sparkle = false;

  // 1. Detect Category Type
  if (category.includes('진료') && !category.includes('지원')) {
    type = 'fish'; // Smooth bioluminescent swimming wave fish
    color = '#22d3ee'; // cyan-400
    glowColor = 'rgba(34, 211, 238, 0.5)';
  } else if (category.includes('진료지원') || category.includes('의료지원')) {
    type = 'fish';
    color = '#06b6d4'; // cyan-500
    glowColor = 'rgba(6, 182, 212, 0.45)';
  } else if (category.includes('간호')) {
    type = 'butterfly'; // Flapping bioluminescent butterfly
    color = '#34d399'; // emerald-400
    glowColor = 'rgba(52, 211, 153, 0.5)';
    ambientSpeed = 1.2;
  } else if (category.includes('연구')) {
    type = 'seed'; // Pulsing molecular/seed energy orb
    color = '#f43f5e'; // rose-500
    glowColor = 'rgba(244, 63, 94, 0.5)';
    sparkle = true;
  } else if (category.includes('행정') || category.includes('문서') || category.includes('회의') || category.includes('결재')) {
    type = 'paperBird'; // Gliding neon origami bird/plane
    color = '#c084fc'; // purple-400
    glowColor = 'rgba(192, 132, 252, 0.45)';
    ambientSpeed = 0.8;
  } else if (category.includes('정보기술') || category.includes('it') || category.includes('tech') || category.includes('보안')) {
    type = 'cube'; // Floating neon data cube
    color = '#3b82f6'; // blue-500
    glowColor = 'rgba(59, 130, 246, 0.5)';
    ambientSpeed = 0.7;
  } else if (category.includes('환자') || category.includes('서비스') || category.includes('고객')) {
    type = 'butterfly';
    color = '#fbbf24'; // amber-400
    glowColor = 'rgba(251, 191, 36, 0.5)';
  } else {
    // Check keywords if category is general or "기타"
    if (text.includes('요약') || text.includes('분석') || text.includes('데이터')) {
      type = 'cube';
      color = '#3b82f6';
      glowColor = 'rgba(59, 130, 246, 0.4)';
    } else if (text.includes('환자') || text.includes('간호') || text.includes('돌봄')) {
      type = 'butterfly';
      color = '#34d399';
      glowColor = 'rgba(52, 211, 153, 0.4)';
    } else if (text.includes('진료') || text.includes('검사') || text.includes('의사')) {
      type = 'fish';
      color = '#22d3ee';
      glowColor = 'rgba(34, 211, 238, 0.4)';
    } else if (text.includes('연구') || text.includes('개발') || text.includes('혁신') || text.includes('새로운')) {
      type = 'seed';
      color = '#f43f5e';
      glowColor = 'rgba(244, 63, 94, 0.4)';
    } else {
      // General fallbacks based on index
      const types: EntityType[] = ['star', 'fish', 'butterfly', 'seed', 'paperBird', 'cube'];
      type = types[index % types.length];
      
      const colors = ['#a8a29e', '#38bdf8', '#fbbf24', '#c084fc', '#34d399', '#f43f5e'];
      color = colors[index % colors.length];
      glowColor = color + '66'; // add alpha
    }
  }

  // 2. Adjust size and characteristics based on text length (more text = slightly bigger entity)
  const textLength = text.length;
  if (textLength > 150) {
    size = 1.15;
    sparkle = true;
  } else if (textLength > 80) {
    size = 1.05;
  } else {
    size = 0.9;
  }

  // Speed adjustments
  ambientSpeed = ambientSpeed * (0.85 + (index % 4) * 0.1);

  return {
    type,
    color,
    glowColor,
    ambientSpeed,
    size,
    sparkle,
  };
}
