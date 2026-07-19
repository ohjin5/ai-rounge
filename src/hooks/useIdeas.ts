import { useState, useEffect, useCallback, useRef } from 'react';
import { Idea } from '../types/idea';
import { fetchIdeas } from '../services/ideaApi';
import { parseCustomDate } from '../utils/dateUtils';

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<string>('최신순');

  // Track newly discovered IDs for the birth spectacle
  const [newlyDiscoveredIds, setNewlyDiscoveredIds] = useState<Set<string>>(new Set());

  // Store existing IDs in a ref to compare for discoveries
  const existingIdsRef = useRef<Set<string>>(new Set());
  
  // Track if a fetch is currently in progress to prevent duplicate overlap requests
  const isFetchingRef = useRef<boolean>(false);

  const loadData = useCallback(async (isManual = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // First load sets isLoading, subsequent loads set isRefreshing
    if (existingIdsRef.current.size === 0) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const data = await fetchIdeas();

      // Compare with previous IDs to detect NEW ideas
      if (existingIdsRef.current.size > 0) {
        const newlyDiscovered = new Set<string>();
        data.forEach((idea) => {
          if (!existingIdsRef.current.has(idea.id)) {
            newlyDiscovered.add(idea.id);
          }
        });

        if (newlyDiscovered.size > 0) {
          setNewlyDiscoveredIds(newlyDiscovered);
          // Clear after 10 seconds
          setTimeout(() => {
            setNewlyDiscoveredIds(new Set());
          }, 10000);
        }
      }

      // Update ref with current IDs
      const currentIds = new Set(data.map((item) => item.id));
      existingIdsRef.current = currentIds;

      // Merge fetched ideas with existing ones to preserve objects and only update changed properties (Section 4)
      setIdeas((prevIdeas) => {
        const prevMap = new Map(prevIdeas.map((idea) => [idea.id, idea]));
        
        return data.map((fetchedIdea) => {
          const prev = prevMap.get(fetchedIdea.id);
          if (prev) {
            // Update only if values actually changed to avoid tearing/flickering
            if (
              prev.like !== fetchedIdea.like ||
              prev.title !== fetchedIdea.title ||
              prev.name !== fetchedIdea.name ||
              prev.department !== fetchedIdea.department ||
              prev.problem !== fetchedIdea.problem ||
              prev.category !== fetchedIdea.category
            ) {
              return { ...prev, ...fetchedIdea };
            }
            return prev;
          }
          return fetchedIdea;
        });
      });

      setLastUpdated(new Date());
      setError(null); // Clear errors on success
    } catch (err: any) {
      console.error('loadData error:', err);
      const displayMessage = err.message || '새로운 데이터를 불러오지 못했습니다. 잠시 후 다시 시도합니다.';
      
      // If we already have data, preserve it and show background error (Section 4 & 14)
      if (existingIdsRef.current.size > 0) {
        setError(`새로운 데이터를 불러오지 못했습니다. 잠시 후 다시 시도합니다. (${displayMessage})`);
      } else {
        setError(displayMessage);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // First fetch on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 30 Seconds auto-polling (Section 4)
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('전체');
    setSortBy('최신순');
  }, []);

  // Client-side helper to manually update individual idea likes upon successful POST
  const updateIdeaLikesLocal = useCallback((ideaId: string, finalLikeCount: number) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) =>
        idea.id === ideaId ? { ...idea, like: finalLikeCount, likes: finalLikeCount, cheer: finalLikeCount } : idea
      )
    );
  }, []);

  // Filter & Sort ideas client-side
  const getFilteredAndSortedIdeas = useCallback((): Idea[] => {
    let result = ideas.filter((idea) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;

      return (
        idea.title.toLowerCase().includes(query) ||
        idea.name.toLowerCase().includes(query) ||
        idea.department.toLowerCase().includes(query) ||
        idea.problem.toLowerCase().includes(query) ||
        idea.category.toLowerCase().includes(query)
      );
    });

    // Category filter
    if (selectedCategory !== '전체') {
      result = result.filter((idea) => {
        const cat = idea.category.toLowerCase();
        const selected = selectedCategory.toLowerCase();

        if (selected === '기타') {
          const standardCategories = ['진료', '간호', '진료지원', '행정', '연구', '환자서비스', '정보기술', 'it', '보안'];
          const isStandard = standardCategories.some((sc) => cat.includes(sc));
          return !isStandard || cat.includes('기타');
        }

        if (selected === '정보기술') {
          return cat.includes('정보기술') || cat.includes('it') || cat.includes('tech');
        }
        if (selected === '진료지원') {
          return cat.includes('진료지원');
        }
        if (selected === '진료') {
          return cat.includes('진료') && !cat.includes('진료지원');
        }

        return cat.includes(selected);
      });
    }

    // Sorting options (Section 12)
    result = [...result].sort((a, b) => {
      if (sortBy === '좋아요순') {
        return (b.like || 0) - (a.like || 0);
      }
      
      // Default / 최신순 (Default Newest First)
      if (sortBy === '최신순' || sortBy === '오래된순') {
        const dateA = parseCustomDate(a.timestamp);
        const dateB = parseCustomDate(b.timestamp);

        if (dateA && dateB) {
          return sortBy === '최신순'
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime();
        }
        if (dateA && !dateB) return -1;
        if (!dateA && dateB) return 1;
        return 0;
      }

      if (sortBy === '제목순') {
        return a.title.localeCompare(b.title, 'ko');
      }

      if (sortBy === '부서순') {
        return a.department.localeCompare(b.department, 'ko');
      }

      return 0;
    });

    return result;
  }, [ideas, searchTerm, selectedCategory, sortBy]);

  return {
    rawIdeas: ideas,
    filteredIdeas: getFilteredAndSortedIdeas(),
    isLoading,
    isRefreshing,
    error,
    setError,
    lastUpdated,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    newlyDiscoveredIds,
    refresh: () => loadData(true),
    clearFilters,
    updateIdeaLikesLocal,
  };
}
