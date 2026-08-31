import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { getProxiedImageUrl } from '../services/api';

const ComicCard = ({ comic }) => {
  const { isBookmarked, toggleBookmark } = useLibrary();
  const bookmarked = isBookmarked(comic.slug);

  const getTypeStyle = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('manhwa')) {
      return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    }
    if (t.includes('manhua')) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(comic);
  };

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-[#12141c] border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      {/* Poster Image Container */}
      <Link to={`/komik/${comic.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900 block">
        <img
          src={getProxiedImageUrl(comic.thumbnail)}
          alt={comic.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60';
          }}
        />
        
        {/* Gradient Overlay on Poster */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md uppercase tracking-wider ${getTypeStyle(comic.type)}`}>
            {comic.type || 'Manga'}
          </span>

          <button
            onClick={handleBookmarkClick}
            className={`pointer-events-auto p-1.5 rounded-lg backdrop-blur-md transition-all ${
              bookmarked 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'bg-black/50 text-slate-300 hover:text-white hover:bg-black/80'
            }`}
            title={bookmarked ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          >
            {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Bottom Rating & Chapter on Image */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
          {comic.score && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-amber-400 font-semibold text-[11px] border border-amber-400/20">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{comic.score}</span>
            </div>
          )}
          {comic.latestChapter && (
            <span className="bg-indigo-950/80 backdrop-blur-md text-indigo-300 font-semibold px-2 py-0.5 rounded text-[11px] border border-indigo-700/30 truncate max-w-[65%]">
              {comic.latestChapter}
            </span>
          )}
        </div>
      </Link>

      {/* Card Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <Link 
            to={`/komik/${comic.slug}`} 
            className="font-bold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug"
            title={comic.title}
          >
            {comic.title}
          </Link>
        </div>

        {/* Updated Time & Direct Chapter Link */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="truncate max-w-[90px]">{comic.updatedOn || 'Baru'}</span>
          </div>

          {comic.chapterSlug ? (
            <Link
              to={`/chapter/${comic.chapterSlug}`}
              className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline text-[11px] truncate max-w-[90px]"
            >
              Baca {comic.latestChapter.replace(/^Chapter\s*/i, 'Ch.')}
            </Link>
          ) : (
            <span className="text-slate-500">Sub Indo</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComicCard;
