import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Calendar, 
  User, 
  ListOrdered, 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  CheckCircle2, 
  Flame, 
  Info,
  Clock
} from 'lucide-react';
import { fetchComicDetail, getProxiedImageUrl } from '../services/api';
import { useLibrary } from '../context/LibraryContext';
import { DetailSkeleton } from '../components/SkeletonLoader';

const DetailPage = () => {
  const { slug } = useParams();
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapterSearch, setChapterSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  const { isBookmarked, toggleBookmark, getComicHistory } = useLibrary();

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const data = await fetchComicDetail(slug);
        setComic(data);
      } catch (err) {
        console.error('Failed to load detail', err);
        setError('Gagal memuat informasi komik. Komik mungkin tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [slug]);

  if (loading) return <DetailSkeleton />;

  if (error || !comic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-800/30">
          <p className="text-rose-400 font-bold text-lg">{error || 'Komik tidak ditemukan'}</p>
          <Link
            to="/"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const bookmarked = isBookmarked(comic.slug);
  const historyEntry = getComicHistory(comic.slug);

  // Filter & Sort Chapters
  const filteredChapters = (comic.chapters || []).filter(ch =>
    ch.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    ch.slug.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const displayedChapters = sortAsc 
    ? [...filteredChapters].reverse() 
    : filteredChapters;

  const firstChapter = comic.chapters?.[comic.chapters.length - 1];
  const latestChapter = comic.chapters?.[0];

  return (
    <div className="min-h-screen pb-16">
      
      {/* Backdrop Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
        <img
          src={getProxiedImageUrl(comic.thumbnail)}
          alt={comic.title}
          className="w-full h-full object-cover filter blur-md opacity-20 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10 space-y-8">
        
        {/* Main Info Card */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 bg-[#12141c]/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          
          {/* Poster */}
          <div className="flex flex-col items-center md:items-start flex-shrink-0">
            <div className="w-48 sm:w-56 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
              <img
                src={getProxiedImageUrl(comic.thumbnail)}
                alt={comic.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick Bookmark Toggle Button */}
            <button
              onClick={() => toggleBookmark(comic)}
              className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                bookmarked
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {bookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Tersimpan di Favorit</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Tambah ke Favorit</span>
                </>
              )}
            </button>
          </div>

          {/* Details & Actions */}
          <div className="flex-1 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              {/* Type, Status, Rating Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  {comic.type || 'Manga'}
                </span>
                
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  comic.status?.toLowerCase().includes('ongoing')
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}>
                  {comic.status || 'Ongoing'}
                </span>

                {comic.rating && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-black/60 text-amber-400 border border-amber-400/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{comic.rating}</span>
                  </span>
                )}
              </div>

              {/* Comic Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {comic.title}
              </h1>

              {/* Metadata Table / Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <User className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-500 block text-[10px]">Pengarang</span>
                    <span className="font-semibold text-slate-200 truncate">{comic.author || 'Anonim'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-500 block text-[10px]">Rilis</span>
                    <span className="font-semibold text-slate-200">{comic.releaseYear || '-'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <ListOrdered className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-500 block text-[10px]">Total Chapter</span>
                    <span className="font-semibold text-slate-200">{comic.totalChapters || 0} Ch.</span>
                  </div>
                </div>
              </div>

              {/* Genres */}
              {comic.genres && comic.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  {comic.genres.map((g) => (
                    <span
                      key={g.slug || g.name}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Read Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
              {historyEntry ? (
                <Link
                  to={`/chapter/${historyEntry.chapterSlug}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Lanjut Baca ({historyEntry.chapterTitle || 'Chapter'})</span>
                </Link>
              ) : null}

              {firstChapter && (
                <Link
                  to={`/chapter/${firstChapter.slug}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Baca Chapter Pertama ({firstChapter.title})</span>
                </Link>
              )}

              {latestChapter && (!firstChapter || firstChapter.slug !== latestChapter.slug) && (
                <Link
                  to={`/chapter/${latestChapter.slug}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all"
                >
                  <span>Chapter Terbaru ({latestChapter.title})</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Synopsis Section */}
        <section className="bg-[#12141c] p-6 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Sinopsis Komik</span>
          </h2>
          <div className="relative text-sm text-slate-300 leading-relaxed">
            <p className={synopsisExpanded ? '' : 'line-clamp-4'}>
              {comic.synopsis}
            </p>
            {comic.synopsis && comic.synopsis.length > 250 && (
              <button
                onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                className="mt-2 text-indigo-400 hover:text-indigo-300 font-semibold text-xs transition-colors"
              >
                {synopsisExpanded ? 'Sembunyikan' : 'Baca Selengkapnya...'}
              </button>
            )}
          </div>
        </section>

        {/* Chapter List Section */}
        <section className="bg-[#12141c] p-6 rounded-2xl border border-slate-800 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Daftar Chapter</h2>
                <p className="text-xs text-slate-400">Total {comic.chapters?.length || 0} chapter Bahasa Indonesia</p>
              </div>
            </div>

            {/* Filter and Sort controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  placeholder="Cari chapter..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-500 pl-8 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition-all"
                title="Ubah Urutan Chapter"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>{sortAsc ? 'Terlama' : 'Terbaru'}</span>
              </button>
            </div>
          </div>

          {/* Chapters Grid / List */}
          {displayedChapters.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Tidak ada chapter yang cocok dengan "{chapterSearch}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[600px] overflow-y-auto pr-1">
              {displayedChapters.map((ch) => {
                const isCurrentRead = historyEntry?.chapterSlug === ch.slug;
                return (
                  <Link
                    key={ch.slug}
                    to={`/chapter/${ch.slug}`}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all group ${
                      isCurrentRead
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-900/70 hover:bg-slate-800/90 border-slate-800/80 hover:border-indigo-500/40 text-slate-200 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isCurrentRead ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                      )}
                      <span className="font-semibold truncate">{ch.title}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-500 flex-shrink-0 ml-2">
                      <Clock className="w-3 h-3" />
                      <span>{ch.date || 'Rilis'}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </section>

      </div>
    </div>
  );
};

export default DetailPage;
