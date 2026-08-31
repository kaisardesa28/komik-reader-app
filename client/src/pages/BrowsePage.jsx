import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Filter, ChevronLeft, ChevronRight, RefreshCw, Flame, Clock } from 'lucide-react';
import { fetchComics } from '../services/api';
import ComicCard from '../components/ComicCard';
import { CardSkeleton } from '../components/SkeletonLoader';

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const typeParam = searchParams.get('type') || 'all';
  const sortParam = searchParams.get('sort') || 'latest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [comics, setComics] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadComics = async () => {
    try {
      setLoading(true);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const res = await fetchComics({
        type: typeParam,
        sort: sortParam,
        page: pageParam
      });
      setComics(res.comics || []);
      setHasNextPage(res.hasNextPage || false);
    } catch (err) {
      console.error('Failed to fetch browse comics', err);
      setError('Gagal memuat daftar komik. Silakan periksa koneksi atau coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComics();
  }, [typeParam, sortParam, pageParam]);

  const handleTypeChange = (type) => {
    setSearchParams({ type, sort: sortParam, page: 1 });
  };

  const handleSortChange = (sort) => {
    setSearchParams({ type: typeParam, sort, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setSearchParams({ type: typeParam, sort: sortParam, page: newPage });
  };

  const types = [
    { id: 'all', label: 'Semua Komik' },
    { id: 'manhwa', label: 'Manhwa (Korea)' },
    { id: 'manhua', label: 'Manhua (China)' },
    { id: 'manga', label: 'Manga (Jepang)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-indigo-400" />
            <span>Katalog Komik Sub Indo</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Jelajahi puluhan ribu koleksi Manga, Manhwa, dan Manhua terjemahan Bahasa Indonesia.
          </p>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => handleSortChange('latest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortParam === 'latest'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Rilis Terbaru</span>
          </button>
          <button
            onClick={() => handleSortChange('popular')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortParam === 'popular'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Terpopuler</span>
          </button>
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTypeChange(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              typeParam === t.id
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Comic Grid or Loading / Error */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-rose-950/20 border border-rose-800/30 rounded-2xl space-y-3">
          <p className="text-rose-400 font-semibold">{error}</p>
          <button
            onClick={loadComics}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
          >
            Muat Ulang
          </button>
        </div>
      ) : comics.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
          <p className="text-slate-300 font-bold">Tidak ada komik ditemukan</p>
          <p className="text-xs text-slate-500">Coba ganti filter atau kembali ke halaman pertama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {comics.map((comic) => (
            <ComicCard key={comic.slug} comic={comic} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-3 pt-8 border-t border-slate-800">
        <button
          onClick={() => handlePageChange(pageParam - 1)}
          disabled={pageParam <= 1 || loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/30 rounded-xl text-indigo-400 font-bold text-xs">
          Halaman {pageParam}
        </div>

        <button
          onClick={() => handlePageChange(pageParam + 1)}
          disabled={!hasNextPage || loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default BrowsePage;
