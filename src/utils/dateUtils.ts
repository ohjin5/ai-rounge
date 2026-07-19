/**
 * Parses various date formats, especially the Korean date format like "2026. 7. 19. 오후 1:30:00".
 * If parsing fails, returns null.
 */
export function parseCustomDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Try standard Date parsing first (e.g., ISO formats "2026-07-19 13:30:00", "2026/07/19 13:30")
  const standardDate = new Date(trimmed.replace(/\//g, '-'));
  if (!isNaN(standardDate.getTime()) && !trimmed.includes('오전') && !trimmed.includes('오후')) {
    return standardDate;
  }

  // Handle Korean date format: "2026. 7. 19. 오후 1:30:00"
  try {
    const krRegex = /(\d{4})[\.\-\/\s]+(\d{1,2})[\.\-\/\s]+(\d{1,2})\.?,?\s*(오전|오후)?\s*(\d{1,2})[시:]\s*(\d{1,2})(?:[분:]\s*(\d{1,2}))?/;
    const match = trimmed.match(krRegex);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // 0-indexed month
      const day = parseInt(match[3], 10);
      const ampm = match[4]; // "오전" or "오후"
      let hour = parseInt(match[5], 10);
      const minute = parseInt(match[6], 10);
      const second = match[7] ? parseInt(match[7], 10) : 0;

      if (ampm === '오후' && hour < 12) {
        hour += 12;
      } else if (ampm === '오전' && hour === 12) {
        hour = 0;
      }

      const parsed = new Date(year, month, day, hour, minute, second);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed parsing Korean date pattern:', trimmed, e);
  }

  // Fallback: extract digits
  try {
    const digits = trimmed.match(/\d+/g);
    if (digits && digits.length >= 3) {
      const year = parseInt(digits[0], 10);
      const month = parseInt(digits[1], 10) - 1;
      const day = parseInt(digits[2], 10);
      const hour = digits[3] ? parseInt(digits[3], 10) : 0;
      const minute = digits[4] ? parseInt(digits[4], 10) : 0;
      const second = digits[5] ? parseInt(digits[5], 10) : 0;

      let adaptedHour = hour;
      if ((trimmed.includes('오후') || trimmed.toUpperCase().includes('PM')) && hour < 12) {
        adaptedHour += 12;
      } else if ((trimmed.includes('오전') || trimmed.toUpperCase().includes('AM')) && hour === 12) {
        adaptedHour = 0;
      }

      const parsed = new Date(year, month, day, adaptedHour, minute, second);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Fallback parser failed:', trimmed, e);
  }

  return null;
}

/**
 * Beautifully formats a date string for display.
 * If parsing fails, returns the original string.
 */
export function formatDateString(dateStr: string): string {
  if (!dateStr) return '날짜 없음';
  const parsed = parseCustomDate(dateStr);
  if (!parsed) return dateStr; // Return original if parsing fails

  const y = parsed.getFullYear();
  const m = parsed.getMonth() + 1;
  const d = parsed.getDate();
  let hour = parsed.getHours();
  const minute = String(parsed.getMinutes()).padStart(2, '0');
  const second = String(parsed.getSeconds()).padStart(2, '0');
  const ampm = hour >= 12 ? '오후' : '오전';

  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;

  return `${y}년 ${m}월 ${d}일 ${ampm} ${hour}시 ${minute}분 ${second}초`;
}

/**
 * Checks if the timestamp is within the last 24 hours.
 */
export function isRecent24Hours(dateStr: string): boolean {
  if (!dateStr) return false;
  const parsed = parseCustomDate(dateStr);
  if (!parsed) return false;

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Return true if the difference is between 0 and 24 hours
  return diffHours >= 0 && diffHours <= 24;
}
