import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { searchComics } from '../services/api';
import ComicCard from '../components/ComicCard';
import { CardSkeleton } from '../components/SkeletonLoader';

const POPULAR_SEARCHES = [
  'Solo Leveling',
  'Magic Emperor',
  'One Piece',
  'Nano Machine',
  'Martial Peak',
  'Return of the Mount Hua Sect',
  'Jujutsu Kaisen',
  'Wind Breaker',
  'Lookism',
  'Eleceed'
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setInputVal(queryParam);
    if (queryParam.trim()) {
      handleSearch(queryParam.trim());
    } else {
      setResults([]);
    }
  }, [queryParam]);

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await searchComics(term);
      setResults(res.results || []);
    } catch (err) {
      console.error('Search error', err);
      setError('Gagal mencari komik. Silakan coba kata kunci lain.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  const handleQuickTagClick = (tag) => {
    setInputVal(tag);
    setSearchParams({ q: tag });
  };

  const handleClear = () => {
    setInputVal('');
    setSearchParams({});
    setResults([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[70vh]">
      
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Cari Komik Sub Indo
        </h1>
        <p className="text-sm text-slate-400">
          Temukan manga, manhwa, dan manhua favoritmu dari puluhan ribu judul database.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative pt-2">
          <input
            type="text"
            placeholder="Ketik judul komik (contoh: Solo Leveling, Magic Emperor)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 pl-12 pr-12 py-3.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-base shadow-xl"
            autoFocus
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 mt-1" />
          
          {inputVal && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 absolute right-4 top-1/2 -translate-y-1/2 mt-1 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Quick Tag Recommendations */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Populer:
          </span>
          {POPULAR_SEARCHES.map((tag) => (
            <button
              key={tag}
              onClick={() => handleQuickTagClick(tag)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {queryParam && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">
              Hasil pencarian untuk "<span className="text-indigo-400 font-bold">{queryParam}</span>"
            </span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {results.length} judul ditemukan
          </span>
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-950/20 border border-rose-800/30 rounded-2xl">
          <p className="text-rose-400 font-semibold">{error}</p>
        </div>
      ) : queryParam && results.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
          <p className="text-slate-200 font-bold text-lg">Komik Tidak Ditemukan</p>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Maaf, kami tidak menemukan komik dengan kata kunci "{queryParam}". Coba gunakan nama judul alternatif atau kata kunci yang lebih umum.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {results.map((comic) => (
            <ComicCard key={comic.slug} comic={comic} />
          ))}
        </div>
      )}

    </div>
  );
};

export default SearchPage;
