import { Idea } from '../types/idea';
import { isRecent24Hours } from './dateUtils';

/**
 * Normalizes a single raw record from the API to fit the Idea interface safely,
 * applying all default values, stripping personal info, and ensuring robust fallback.
 */
export function mapRawToAgentIdea(raw: any, index: number): Idea {
  const timestamp = typeof raw.timestamp === 'string' ? raw.timestamp.trim() : '';
  
  // 1. Generate unique stable ID if missing
  let id = typeof raw.id === 'string' ? raw.id.trim() : '';
  if (!id) {
    id = `temp-idea-${timestamp.replace(/[^a-zA-Z0-9]/g, '')}-${index}`;
  }

  // 2. Handle displayName and name normalization
  const displayName = raw.displayName === true || raw.displayName === 'true' || raw.displayName === undefined;
  let name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!displayName || !name) {
    name = '익명';
  }

  // 3. Normalize other fields with requested fallbacks
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : '제목 없는 AI 아이디어';
  const department = typeof raw.department === 'string' && raw.department.trim() ? raw.department.trim() : '소속 미입력';
  const category = typeof raw.category === 'string' && raw.category.trim() ? raw.category.trim() : '기타';
  const problem = typeof raw.problem === 'string' ? raw.problem.trim() : '';
  const description = typeof raw.description === 'string' ? raw.description.trim() : '';

  // 4. Determine if it is a new idea (within last 24 hours)
  const isNew = timestamp ? isRecent24Hours(timestamp) : false;

  // 5. Parse like / likes / cheer / cheers property
  const likeVal = raw.like ?? raw.likes ?? raw.cheer ?? raw.cheers ?? raw.cheerCount ?? 0;
  const like = typeof likeVal === 'number' ? likeVal : parseInt(String(likeVal), 10) || 0;

  return {
    id,
    timestamp,
    name,
    department,
    title,
    problem,
    description,
    category,
    displayName,
    like,
    likes: like,
    cheer: like,
    isNew,
  };
}

/**
 * Normalizes an array of raw ideas, removing duplicates by id.
 */
export function normalizeIdeas(rawList: any[]): Idea[] {
  if (!Array.isArray(rawList)) return [];

  const seenIds = new Set<string>();
  const normalized: Idea[] = [];

  rawList.forEach((item, index) => {
    if (!item) return;
    const mapped = mapRawToAgentIdea(item, index);
    if (!seenIds.has(mapped.id)) {
      seenIds.add(mapped.id);
      normalized.push(mapped);
    }
  });

  return normalized;
}
