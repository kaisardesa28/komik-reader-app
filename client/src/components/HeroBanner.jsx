import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, ChevronLeft, ChevronRight, Sparkles, Info } from 'lucide-react';
import { getProxiedImageUrl } from '../services/api';

const HeroBanner = ({ featured = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (!featured || featured.length === 0) return null;

  const current = featured[currentIndex] || featured[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl mb-8 min-h-[360px] md:min-h-[420px] flex items-end">
      {/* Background Image with Blurs & Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={getProxiedImageUrl(current.thumbnail)}
          alt={current.title}
          className="w-full h-full object-cover scale-105 filter blur-sm opacity-25 brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/60 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 md:p-10 w-full flex flex-col md:flex-row items-center gap-6 md:gap-8 justify-between">
        
        {/* Left Side: Text and Actions */}
        <div className="flex-1 max-w-2xl space-y-4">
          
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trending Hari Ini</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {current.type || 'Manga'} Sub Indo
            </span>
            {current.score && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-black/60 text-amber-400 border border-amber-400/20">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{current.score}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight line-clamp-2 drop-shadow-md">
            {current.title}
          </h1>

          {/* Synopsis preview */}
          <p className="text-slate-300 text-sm md:text-base line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl text-slate-300/90">
            {current.synopsis || 'Baca komik terjemahan bahasa indonesia lengkap dengan update chapter terbaru secara gratis.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {current.chapterSlug ? (
              <Link
                to={`/chapter/${current.chapterSlug}`}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 text-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Baca {current.latestChapter || 'Sekarang'}</span>
              </Link>
            ) : null}

            <Link
              to={`/komik/${current.slug}`}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all hover:text-white text-sm backdrop-blur-md"
            >
              <Info className="w-4 h-4" />
              <span>Detail Komik</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Comic Poster Card */}
        <div className="hidden sm:block flex-shrink-0">
          <Link to={`/komik/${current.slug}`} className="block relative group">
            <div className="w-44 md:w-52 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500/40 group-hover:border-indigo-400 transition-all group-hover:scale-105 duration-300">
              <img
                src={getProxiedImageUrl(current.thumbnail)}
                alt={current.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/90 px-2.5 py-1 rounded-full border border-indigo-800/60 block truncate">
                  {current.latestChapter || 'Chapter Baru'}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Carousel Navigation Arrows */}
      {featured.length > 1 && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-slate-800 hover:border-slate-600 transition-all"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-xs font-semibold text-slate-400 px-2">
            {currentIndex + 1} / {featured.length}
          </div>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-slate-800 hover:border-slate-600 transition-all"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
