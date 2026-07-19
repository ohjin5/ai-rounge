import { useState, useCallback } from 'react';
import { likeIdea } from '../services/ideaApi';
import { getClientId } from '../utils/clientId';
import { getLikedIdeaIds, saveLikedIdeaId } from '../utils/likedIdeas';

export function useIdeaLike(onLikeSuccess: (ideaId: string, newLikeCount: number) => void) {
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [likeError, setLikeError] = useState<string | null>(null);

  const performLike = useCallback(async (ideaId: string) => {
    if (isLiking) return;
    setIsLiking(true);
    setLikeError(null);

    const clientId = getClientId();

    try {
      const result = await likeIdea(ideaId, clientId);
      
      // Save ID to localStorage (Section 9 - even if alreadyLiked is true, save it)
      saveLikedIdeaId(ideaId);

      // Trigger local state updates (Section 8)
      if (result && typeof result.like === 'number') {
        onLikeSuccess(ideaId, result.like);
      }
      
      return result;
    } catch (err: any) {
      console.error('Like error:', err);
      const displayMsg = err.message || '좋아요를 반영하지 못했습니다. 다시 시도해 주세요.';
      setLikeError(displayMsg);
      throw err;
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, onLikeSuccess]);

  const hasLiked = useCallback((ideaId: string) => {
    return getLikedIdeaIds().includes(ideaId);
  }, []);

  return {
    performLike,
    isLiking,
    likeError,
    setLikeError,
    hasLiked,
  };
}
