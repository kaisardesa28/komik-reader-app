import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Compass, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  Tag,
  Layers,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { fetchComics } from '../services/api';
import ComicCard from '../components/ComicCard';
import { CardSkeleton } from '../components/SkeletonLoader';

const GENRE_LIST = [
  { id: 'all', label: 'Semua Genre' },
  { id: 'action', label: 'Aksi (Action)' },
  { id: 'fantasy', label: 'Fantasi (Fantasy)' },
  { id: 'isekai', label: 'Isekai' },
  { id: 'reincarnation', label: 'Reinkarnasi' },
  { id: 'romance', label: 'Romantis (Romance)' },
  { id: 'martial-arts', label: 'Martial Arts' },
  { id: 'adventure', label: 'Petualangan (Adventure)' },
  { id: 'comedy', label: 'Komedi (Comedy)' },
  { id: 'drama', label: 'Drama' },
  { id: 'sci-fi', label: 'Sci-Fi' },
  { id: 'shounen', label: 'Shounen' },
  { id: 'supernatural', label: 'Supernatural' },
  { id: 'school-life', label: 'Sekolah (School Life)' },
  { id: 'mystery', label: 'Misteri (Mystery)' },
  { id: 'harem', label: 'Harem' },
  { id: 'seinen', label: 'Seinen' },
  { id: 'horror', label: 'Horror' },
  { id: 'magic', label: 'Magic' },
  { id: 'system', label: 'System' },
  { id: 'psychological', label: 'Psikologis' }
];

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const typeParam = searchParams.get('type') || 'all';
  const statusParam = searchParams.get('status') || 'all';
  const genreParam = searchParams.get('genre') || 'all';
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
        status: statusParam,
        genre: genreParam,
        sort: sortParam,
        page: pageParam
      });
      setComics(res.comics || []);
      setHasNextPage(res.hasNextPage || false);
    } catch (err) {
      console.error('Failed to fetch browse comics', err);
      setError('Gagal memuat daftar komik. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComics();
  }, [typeParam, statusParam, genreParam, sortParam, pageParam]);

  const updateFilters = (newParams) => {
    const params = {
      type: typeParam,
      status: statusParam,
      genre: genreParam,
      sort: sortParam,
      page: '1',
      ...newParams
    };
    // Clean 'all' defaults
    const cleaned = {};
    Object.keys(params).forEach(k => {
      if (params[k] && params[k] !== 'all') {
        cleaned[k] = params[k];
      }
    });
    if (params.page && params.page !== '1') cleaned.page = params.page;
    setSearchParams(cleaned);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const types = [
    { id: 'all', label: 'Semua Tipe' },
    { id: 'manhwa', label: 'Manhwa (Korea)' },
    { id: 'manhua', label: 'Manhua (China)' },
    { id: 'manga', label: 'Manga (Jepang)' },
  ];

  const statuses = [
    { id: 'all', label: 'Semua Status' },
    { id: 'ongoing', label: 'Masih Ongoing (Berlanjut)', icon: PlayCircle, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { id: 'tamat', label: 'Sudah Tamat (Completed)', icon: CheckCircle2, color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
  ];

  const hasActiveFilters = typeParam !== 'all' || statusParam !== 'all' || genreParam !== 'all' || sortParam !== 'latest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-indigo-400" />
            <span>Katalog & Filter Komik Lengkap</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sortir dan filter komik berdasarkan status (Ongoing / Tamat), kategori jenis, dan genre tema.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => updateFilters({ sort: 'latest' })}
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
            onClick={() => updateFilters({ sort: 'popular' })}
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

      {/* FILTER CONTROLS BOX */}
      <div className="bg-[#12141c] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
        
        {/* Row 1: STATUS FILTER (Ongoing vs Tamat) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Status Komik</span>
            </label>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Semua Filter</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((s) => {
              const active = (statusParam === s.id) || (statusParam === 'end' && s.id === 'tamat');
              return (
                <button
                  key={s.id}
                  onClick={() => updateFilters({ status: s.id })}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {s.icon && <s.icon className={`w-3.5 h-3.5 ${active ? 'text-white' : ''}`} />}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: TYPE FILTER (Manga, Manhwa, Manhua) */}
        <div className="space-y-2 pt-3 border-t border-slate-800/80">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kategori Jenis Komik</span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => updateFilters({ type: t.id })}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  typeParam === t.id
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: GENRE / THEME FILTER */}
        <div className="space-y-2 pt-3 border-t border-slate-800/80">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Genre / Kategori Tema</span>
          </label>

          <div className="flex flex-wrap items-center gap-1.5 max-h-36 overflow-y-auto pr-1">
            {GENRE_LIST.map((g) => (
              <button
                key={g.id}
                onClick={() => updateFilters({ genre: g.id })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                  genreParam === g.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm font-bold'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Comic Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
        <div className="p-16 text-center bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
          <p className="text-slate-200 font-bold text-lg">Tidak Ada Komik dengan Kombinasi Filter Ini</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba ubah status atau genre yang dipilih untuk menemukan komik lainnya.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            Reset Filter
          </button>
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
          onClick={() => updateFilters({ page: String(pageParam - 1) })}
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
          onClick={() => updateFilters({ page: String(pageParam + 1) })}
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
