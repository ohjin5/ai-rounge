export function getLikedIdeaIds(): string[] {
  try {
    const value = localStorage.getItem(
      'ai-idea-garden-liked-ideas'
    );

    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function saveLikedIdeaId(ideaId: string): void {
  const ids = new Set(getLikedIdeaIds());
  ids.add(ideaId);

  localStorage.setItem(
    'ai-idea-garden-liked-ideas',
    JSON.stringify(Array.from(ids))
  );
}
