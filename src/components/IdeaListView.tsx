import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Clock, User, Building2, ChevronRight, AlertCircle, Heart } from 'lucide-react';
import { Idea } from '../types/idea';
import { formatDateString } from '../utils/dateUtils';
import { getPastelThemeForIdea } from '../utils/pastelColors';

interface IdeaListViewProps {
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
}

export default function IdeaListView({ ideas, onSelectIdea }: IdeaListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Client-side search for the list view to satisfy the convenience requirement
  const filteredIdeas = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return ideas;

    return ideas.filter((idea) => {
      return (
        idea.title.toLowerCase().includes(query) ||
        idea.name.toLowerCase().includes(query) ||
        idea.department.toLowerCase().includes(query) ||
        idea.category.toLowerCase().includes(query) ||
        (idea.problem && idea.problem.toLowerCase().includes(query))
      );
    });
  }, [ideas, searchTerm]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6 select-text">
      {/* Search Input and Status bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="아이디어 제목, 부서, 제안자 등으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 hover:bg-slate-950/90 focus:bg-slate-950 border border-white/10 hover:border-white/20 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-sm text-white rounded-xl placeholder-slate-500 outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white text-xs"
            >
              지우기
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>검색된 아이디어:</span>
          <span className="text-cyan-400 font-bold">{filteredIdeas.length}</span>
          <span>/</span>
          <span>전체:</span>
          <span className="text-slate-300 font-bold">{ideas.length}</span>
        </div>
      </div>

      {/* Ideas Card Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 rounded-3xl border border-white/5 min-h-[300px]">
          <AlertCircle className="w-12 h-12 text-slate-500 mb-3 stroke-[1.5]" />
          <h4 className="text-slate-300 font-semibold text-sm">일치하는 아이디어가 없습니다</h4>
          <p className="text-xs text-slate-500 mt-1">다른 검색어로 다시 시도해 보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIdeas.map((idea, index) => {
            const theme = getPastelThemeForIdea(idea.id);
            
            return (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
                onClick={() => onSelectIdea(idea)}
                className="group relative rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/5 hover:border-white/10 shadow-lg cursor-pointer overflow-hidden transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between"
              >
                {/* Colored Accent strip on the left with the matching pastel color */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: theme.borderColor }}
                />

                <div className="p-5 md:p-6 pl-6 flex flex-col gap-4">
                  {/* Top metadata tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {idea.category || '기타'}
                      </span>
                      {idea.like > 0 && (
                        <span className="bg-rose-500/10 text-rose-300 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                          <span>{idea.like}</span>
                        </span>
                      )}
                    </div>
                    {idea.timestamp && (
                      <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {formatDateString(idea.timestamp).split(' ')[1] + ' ' + formatDateString(idea.timestamp).split(' ')[2]}
                      </span>
                    )}
                  </div>

                  {/* Title & summary */}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-extrabold text-white tracking-tight group-hover:text-cyan-200 transition-colors leading-snug line-clamp-1">
                      {idea.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                      {idea.problem || '입력 상세 내용 없음'}
                    </p>
                  </div>
                </div>

                {/* Footer block: Author & Department */}
                <div className="mx-6 py-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{idea.name || '익명'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="max-w-[120px] truncate">{idea.department || '미지정'}</span>
                    </span>
                  </div>

                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                    <span>자세히</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
