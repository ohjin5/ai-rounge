import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Copy, Sparkles, Building2, HelpCircle, Check, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Idea } from '../types/idea';
import { formatDateString } from '../utils/dateUtils';
import { getIdeaVisualConfig } from '../utils/ideaVisualMapper';
import { useIdeaLike } from '../hooks/useIdeaLike';

interface IdeaOverlayProps {
  idea: Idea;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onCheer?: (ideaId: string, newLikeCount: number) => void;
}

export default function IdeaOverlay({
  idea,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onCheer,
}: IdeaOverlayProps) {
  const [copied, setCopied] = useState(false);
  const [cheerParticles, setCheerParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);
  const [isCheering, setIsCheering] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const nextParticleId = useRef(0);
  const visualConfig = getIdeaVisualConfig(idea, 0);

  const { performLike, isLiking, likeError, setLikeError, hasLiked } = useIdeaLike((id, newCount) => {
    if (onCheer) {
      onCheer(id, newCount);
    }
  });

  const isAlreadyLikedLocal = hasLiked(idea.id);

  // Close on ESC key press or navigation on Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  // Copy contents to clipboard beautifully
  const handleCopy = async () => {
    const textToCopy = `
[AI Agent Idea Garden - 전시 아이디어]
■ 제목: ${idea.title}
■ 제안 분야: ${idea.category}
■ 소속/제안자: ${idea.department || '소속 미입력'} / ${idea.name || '익명'}

■ 해결하려는 문제 상황:
${idea.problem || '작성된 상세 내용이 없습니다.'}

출처: AI Agent Idea Garden (우리의 아이디어가 살아 움직이는 공간)
`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    if (isAlreadyLikedLocal) {
      // Show toast message (Section 10)
      setToastMessage("이미 좋아요를 누른 아이디어입니다.");
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }

    try {
      // Trigger temporary 1-second pulse scale effect (Section 10)
      setIsCheering(true);
      setTimeout(() => setIsCheering(false), 1000);

      // Create burst particles (Section 10)
      const idStart = nextParticleId.current;
      const particles = Array.from({ length: 6 }, (_, idx) => {
        const angle = (idx / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const distance = 40 + Math.random() * 40;
        return {
          id: idStart + idx,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 10,
          emoji: Math.random() > 0.5 ? '✨' : '💖',
        };
      });
      nextParticleId.current += 6;
      setCheerParticles((prev) => [...prev, ...particles]);

      const res = await performLike(idea.id);

      // Check if server said it was already liked
      if (res && res.alreadyLiked) {
        setToastMessage("이미 좋아요를 누른 아이디어입니다.");
        setTimeout(() => setToastMessage(null), 2000);
      }
    } catch (err) {
      // Errors are handled inside performLike, but we can do a secondary toast
      setToastMessage("좋아요를 반영하지 못했습니다. 다시 시도해 주세요.");
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Container holding Navigation buttons and Captain card */}
      <div className="relative w-full max-w-2xl flex items-center gap-4">
        
        {/* Previous Navigation Button (Desktop) */}
        {hasPrev && onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-[-58px] hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-white/25 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="이전 아이디어"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Gallery Caption Glassmorphic Card */}
        <motion.div
          className="w-full relative rounded-[32px] bg-slate-900/85 backdrop-blur-3xl border border-white/15 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
          animate={{
            scale: isCheering ? 1.08 : 1.0,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 14 }}
        >
          {/* Luminous top neon edge gradient corresponding to category */}
          <div
            className="h-1.5 w-full animate-pulse"
            style={{
              background: `linear-gradient(90deg, transparent, ${visualConfig.color}, transparent)`,
            }}
          />

          {/* Close, Copy Actions Toolbar */}
          <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500"
              title="아이디어 복사하기"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Exhibition Card Content padding */}
          <div className="p-6 md:p-8 max-h-[82vh] overflow-y-auto custom-scrollbar select-text text-left">
            
            {/* Meta Tags info */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-slate-300 font-sans">
                {/* Category tag */}
                <div
                  className="px-3 py-1 rounded-full font-bold border text-[10px] md:text-xs tracking-wider"
                  style={{
                    color: visualConfig.color,
                    borderColor: `${visualConfig.color}66`,
                    backgroundColor: `${visualConfig.color}18`,
                  }}
                >
                  {idea.category}
                </div>
                
                {/* Department tag */}
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] md:text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{idea.department || '소속 미입력'}</span>
                </div>

                {/* Author name */}
                <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] md:text-xs font-semibold">
                  <span>{idea.name || '익명'}</span>
                </div>
              </div>
            </div>

            {/* Main Title Heading */}
            <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight mb-8 pr-16 leading-snug flex items-start gap-3">
              <Sparkles
                className="w-6 h-6 md:w-8 md:h-8 shrink-0 mt-1"
                style={{
                  color: visualConfig.color,
                  filter: `drop-shadow(0 0 8px ${visualConfig.color})`,
                }}
              />
              <span>{idea.title}</span>
            </h2>

            {/* Body Descriptions */}
            <div className="space-y-6">
              
              {/* Problem Section (왜 필요한가요?) */}
              <div className="p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all"
                  style={{ backgroundColor: visualConfig.color }}
                />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>왜 필요한가요?</span>
                </h4>
                <p className="text-sm md:text-base text-slate-200 leading-relaxed whitespace-pre-wrap pl-1 font-normal">
                  {idea.problem ? idea.problem : '작성된 상세 내용이 없습니다.'}
                </p>
              </div>
            </div>

            {/* Submission Date & Elegant Like Button */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Like Button */}
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleLikeClick}
                  disabled={isLiking}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm font-bold cursor-pointer select-none ${
                    isAlreadyLikedLocal
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 font-extrabold'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  } disabled:opacity-65`}
                >
                  <Heart className={`w-4 h-4 ${isAlreadyLikedLocal ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>
                    {isLiking 
                      ? '처리 중...' 
                      : isAlreadyLikedLocal 
                      ? `♥ 좋아요 ${idea.like}` 
                      : `♡ 좋아요 ${idea.like}`
                    }
                  </span>
                </motion.button>

                {/* Particle burst renderer */}
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {cheerParticles.map((p) => (
                    <motion.span
                      key={p.id}
                      initial={{ opacity: 1, scale: 0.4, x: 0, y: 0 }}
                      animate={{ opacity: 0, scale: 1.4, x: p.x, y: p.y }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      onAnimationComplete={() => {
                        setCheerParticles((prev) => prev.filter((item) => item.id !== p.id));
                      }}
                      className="absolute left-1/2 top-1/2 -ml-2 -mt-2 text-xs select-none pointer-events-none"
                    >
                      {p.emoji}
                    </motion.span>
                  ))}
                </div>
              </div>

              {idea.timestamp && (
                <div className="text-[10px] md:text-xs text-slate-500 font-mono">
                  등록일: {formatDateString(idea.timestamp)}
                </div>
              )}
            </div>

            {/* Toast Alerts or Error Warnings inside modal */}
            <AnimatePresence>
              {(toastMessage || likeError) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mt-4 p-3 rounded-xl text-center text-xs border bg-slate-950/80 backdrop-blur"
                  style={{
                    borderColor: likeError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: likeError ? '#f87171' : '#e2e8f0',
                  }}
                >
                  {likeError || toastMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Next Navigation Button (Desktop) */}
        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-[-58px] hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-white/25 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="다음 아이디어"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Mobile-only Navigation bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
        <button
          onClick={onPrev}
          disabled={!hasPrev || !onPrev}
          className="px-4 py-2 rounded-full bg-slate-900/95 text-xs border border-white/10 text-slate-300 disabled:opacity-40 transition shadow-lg"
        >
          이전
        </button>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-full border border-white/5 shadow">
          {hasPrev ? '슬라이드 이동' : '끝'}
        </span>
        <button
          onClick={onNext}
          disabled={!hasNext || !onNext}
          className="px-4 py-2 rounded-full bg-slate-900/95 text-xs border border-white/10 text-slate-300 disabled:opacity-40 transition shadow-lg"
        >
          다음
        </button>
      </div>
    </div>
  );
}
