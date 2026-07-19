import React, { useState, useEffect, useRef } from 'react';
import { useIdeas } from './hooks/useIdeas';
import { useFullscreen } from './hooks/useFullscreen';
import ExhibitionScene from './components/ExhibitionScene';
import IdeaListView from './components/IdeaListView';
import IdeaOverlay from './components/IdeaOverlay';
import { AgentIdea } from './types/idea';
import {
  Search,
  RotateCw,
  Play,
  Pause,
  X,
  Sparkles,
  Sliders,
  AlertTriangle,
  HelpCircle,
  Clock,
  Maximize2,
  List,
  Layers,
  LayoutGrid
} from 'lucide-react';

export default function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  
  // View mode state: 'bubble' (default) or 'list'
  const [viewMode, setViewMode] = useState<'bubble' | 'list'>('bubble');

  // Fetch ideas, filter handlers, and status from hooks
  const {
    rawIdeas,
    filteredIdeas,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    newlyDiscoveredIds,
    refresh,
    clearFilters,
    cheerIdeaById,
  } = useIdeas();

  // Fullscreen handler
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Scene Controls
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  // Look up selected idea from rawIdeas dynamically so that it updates when cheers change
  const selectedIdea = rawIdeas.find((idea) => idea.id === selectedIdeaId) || null;
  
  // Admin Mode Control (Visible ONLY if ?admin=true is present in the URL)
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Check URL query parameters on mount to activate Operator HUD
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('operator') === 'true') {
      setIsAdminMode(true);
    } else {
      setIsAdminMode(false);
    }
  }, []);

  // Autoplay Pause when Tab is hidden or prefers-reduced-motion is enabled
  const [isTabActive, setIsTabActive] = useState<boolean>(true);
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Combine pause conditions: user requested pause, tab hidden, prefers reduced motion, or overlay active
  const shouldPauseAnimation = isPaused || !isTabActive || prefersReducedMotion || !!selectedIdea;

  // Navigation inside detail overlay
  const currentOverlayIndex = selectedIdea
    ? filteredIdeas.findIndex((idea) => idea.id === selectedIdea.id)
    : -1;

  const hasPrev = currentOverlayIndex > 0;
  const hasNext = currentOverlayIndex < filteredIdeas.length - 1 && currentOverlayIndex !== -1;

  const handlePrevIdea = () => {
    if (hasPrev) {
      setSelectedIdeaId(filteredIdeas[currentOverlayIndex - 1].id);
    }
  };

  const handleNextIdea = () => {
    if (hasNext) {
      setSelectedIdeaId(filteredIdeas[currentOverlayIndex + 1].id);
    }
  };

  // Double click background to toggle fullscreen naturally
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'CANVAS') {
      toggleFullscreen(mainRef.current);
    }
  };

  return (
    <div
      ref={mainRef}
      onDoubleClick={handleDoubleClick}
      className="relative min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden select-none font-sans"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #0d1e36 0%, #071326 50%, #020612 100%)',
      }}
    >
      {/* BACKGROUND DECORATIONS (Soft, misty bioluminescent color spots for the night garden theme) */}
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-teal-500/4 blur-[130px] pointer-events-none z-0" />

      {/* 1. TOP COMMON HEADER (Minimally designed for elegant public showcase) */}
      <header className="relative w-full z-30 px-6 py-6 md:px-10 md:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        {/* Left corner: Logo and description */}
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h1 className="text-xs md:text-sm font-sans tracking-[0.25em] text-white font-black uppercase">
              AI AGENT IDEA GARDEN
            </h1>
          </div>
          <p className="text-[10px] md:text-xs text-cyan-200/70 font-semibold tracking-normal pl-0.5">
            우리의 아이디어가 살아 움직이는 공간
          </p>
        </div>

        {/* Center/Right corner: View Toggle Pill Tab */}
        <div className="flex items-center bg-slate-900/60 p-1.5 rounded-full border border-white/10 shadow-lg">
          <button
            onClick={() => setViewMode('bubble')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-2 ${
              viewMode === 'bubble'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-md border border-cyan-500/30'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>버블 보기</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-md border border-cyan-500/30'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>목록 보기</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative z-10 w-full overflow-y-auto">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative flex flex-col items-center gap-5">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-xs font-sans tracking-widest text-cyan-200 font-semibold uppercase animate-pulse">
                  정원 불러오는 중...
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  아이디어 정원을 채우고 있습니다. 잠시만 기다려 주십시오.
                </span>
              </div>
            </div>
          </div>
        ) : error && rawIdeas.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto min-h-[400px]">
            <AlertTriangle className="w-10 h-10 text-rose-500/80 mb-4 stroke-[1.5]" />
            <h4 className="text-sm font-bold text-slate-200">데이터를 가져오지 못했습니다</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {error}. 네트워크 연결 상태를 확인한 다음 다시 시도해 주세요.
            </p>
            <button
              onClick={() => refresh()}
              className="mt-6 px-4 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/20 hover:border-cyan-500/40 transition flex items-center gap-2 mx-auto"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>정원 복구하기</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 w-full h-full relative flex flex-col">
            {viewMode === 'bubble' ? (
              // BUBBLE VIEW MODE
              <ExhibitionScene
                ideas={filteredIdeas}
                isPaused={shouldPauseAnimation}
                newlyDiscoveredIds={Array.from(newlyDiscoveredIds)}
                onSelectIdea={(idea) => setSelectedIdeaId(idea?.id || null)}
                selectedIdeaId={selectedIdeaId}
              />
            ) : (
              // LIST VIEW MODE
              <div className="animate-fade-in w-full h-full">
                <IdeaListView
                  ideas={filteredIdeas}
                  onSelectIdea={(idea) => setSelectedIdeaId(idea?.id || null)}
                />
              </div>
            )}

            {/* Zero Filter Result Message Overlay (Visible only in admin filter actions) */}
            {filteredIdeas.length === 0 && rawIdeas.length > 0 && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 backdrop-blur-sm z-20">
                <div className="max-w-xs bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 pointer-events-auto shadow-2xl">
                  <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-3 stroke-[1.5]" />
                  <h4 className="text-xs font-semibold text-slate-300">조건에 맞는 아이디어가 없습니다</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    일치하는 아이디어가 존재하지 않습니다. 어드민 HUD에서 필터를 해제해 주세요.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-white transition border border-white/5"
                  >
                    필터 초기화
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. FOOTER (Guide instructions clearly shown across both view modes) */}
      <footer className="relative w-full z-30 px-6 py-6 md:px-10 md:py-8 border-t border-white/5 bg-slate-950/40 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left max-w-2xl">
          <p className="text-[10px] md:text-xs text-slate-400 font-sans leading-relaxed">
            • 아이디어는 Google Form을 통해 입력됩니다.
            <span className="mx-2 hidden md:inline">|</span>
            <span className="text-cyan-400/90 font-bold block md:inline mt-0.5 md:mt-0">
              입력된 아이디어는 약 30초 후 화면에 자동으로 반영됩니다.
            </span>
          </p>
          <p className="text-[10px] md:text-xs text-slate-500 font-sans mt-0.5">
            • 환자정보, 개인정보 및 민감정보는 입력하지 마세요.
          </p>
        </div>

        {/* Fullscreen Button - Publicly accessible for exhibition comfort */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFullscreen(mainRef.current)}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all text-xs flex items-center gap-1.5 shadow"
            title="전체화면 토글"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>전체화면</span>
          </button>
        </div>
      </footer>

      {/* 4. ADMIN HUD OPERATOR OVERLAY (Visible ONLY when URL has ?admin=true parameter) */}
      {isAdminMode && (
        <div className="absolute top-24 right-4 z-40 w-full max-w-sm animate-fade-in pointer-events-auto">
          <div className="rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-extrabold tracking-wider uppercase text-white">
                  전시 운영 어드민 허브 (HUD)
                </span>
              </div>
              <button
                onClick={() => setIsAdminMode(false)}
                className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="어드민 모드 종료"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Panel Controls */}
            <div className="p-4 space-y-4">
              {/* Counters */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    전체 수집 아이디어
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {rawIdeas.length}
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    필터 렌더링 수
                  </div>
                  <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                    {filteredIdeas.length}
                  </div>
                </div>
              </div>

              {/* Admin Search Bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="텍스트 검색 (제목, 부서, 역할...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white rounded-xl placeholder-slate-500 outline-none transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider pl-1 flex items-center justify-between">
                  <span>분야 필터링</span>
                  {selectedCategory !== '전체' && (
                    <button
                      onClick={() => setSelectedCategory('전체')}
                      className="text-cyan-400 hover:underline"
                    >
                      초기화
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {['전체', '진료', '간호', '진료지원', '행정', '연구', '환자서비스', '정보기술', '기타'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition ${
                        selectedCategory === cat
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Selection */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider pl-1">
                  정렬 방식
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['최신순', '오래된순', '제목순', '부서순'].map((sortOption) => (
                    <button
                      key={sortOption}
                      onClick={() => setSortBy(sortOption)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] text-center border transition-all ${
                        sortBy === sortOption
                          ? 'bg-white/10 text-white border-white/20'
                          : 'bg-white/[0.01] hover:bg-white/[0.04] text-slate-400 border-white/5'
                      }`}
                    >
                      {sortOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Play/Pause & Force sync */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-4">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    isPaused
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/5'
                  }`}
                  title="전시장 움직임 일시정지"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? '애니 재생' : '애니 정지'}</span>
                </button>

                <button
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 disabled:opacity-50 transition"
                  title="즉시 새로고침"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>새로고침</span>
                </button>
              </div>
            </div>

            {/* Footer with last synced timestamp */}
            <div className="p-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[8px] font-mono text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                <span>마지막 동기화: {lastUpdated ? lastUpdated.toLocaleTimeString() : '없음'}</span>
              </span>
              <span className="font-bold tracking-wider">ADMIN PANEL</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. CAPTION OVERLAY MODAL */}
      {selectedIdea && (
        <IdeaOverlay
          idea={selectedIdea}
          onClose={() => setSelectedIdeaId(null)}
          onPrev={handlePrevIdea}
          onNext={handleNextIdea}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onCheer={cheerIdeaById}
        />
      )}
    </div>
  );
}
