import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, History, Trash2, BookOpen, Clock, ArrowRight, Star } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { getProxiedImageUrl } from '../services/api';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState('bookmarks'); // 'bookmarks' | 'history'
  const { bookmarks, history, toggleBookmark, removeHistory, clearAllHistory } = useLibrary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[75vh]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Koleksi Saya
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Akses komik favorit yang disimpan dan pantau riwayat chapter yang sedang kamu baca.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Favorit ({bookmarks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Baca ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Bookmarks Tab Content */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          {bookmarks.length === 0 ? (
            <div className="p-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Belum Ada Komik Favorit</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Klik ikon bookmark pada komik mana pun untuk menyimpannya di sini agar mudah dibaca nanti.
                </p>
              </div>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                <span>Jelajahi Komik</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {bookmarks.map((comic) => (
                <div key={comic.slug} className="group relative flex flex-col rounded-xl overflow-hidden bg-[#12141c] border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
                  
                  {/* Poster */}
                  <Link to={`/komik/${comic.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900 block">
                    <img
                      src={getProxiedImageUrl(comic.thumbnail)}
                      alt={comic.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-transparent to-transparent opacity-80" />

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleBookmark(comic);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-slate-300 hover:text-white transition-all backdrop-blur-md"
                      title="Hapus dari favorit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Link>

                  {/* Info */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <Link to={`/komik/${comic.slug}`} className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {comic.title}
                    </Link>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40">
                        {comic.type || 'Manga'}
                      </span>
                      <Link
                        to={`/komik/${comic.slug}`}
                        className="text-xs text-slate-400 hover:text-white font-medium"
                      >
                        Buka →
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearAllHistory}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-lg bg-rose-950/20 border border-rose-900/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua Riwayat</span>
              </button>
            </div>
          )}

          {history.length === 0 ? (
            <div className="p-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Belum Ada Riwayat Baca</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Semua chapter yang kamu baca akan otomatis tercatat di sini beserta progress bacaannya.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                <span>Mulai Membaca Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.comicSlug}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#12141c] border border-slate-800 hover:border-indigo-500/40 transition-all gap-4 group"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <Link to={`/komik/${item.comicSlug}`} className="w-14 sm:w-16 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-800">
                      <img
                        src={getProxiedImageUrl(item.comicThumbnail)}
                        alt={item.comicTitle}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1 space-y-1">
                      <Link to={`/komik/${item.comicSlug}`} className="font-bold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors truncate block">
                        {item.comicTitle}
                      </Link>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="text-indigo-300 font-medium">{item.chapterTitle}</span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.readAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/chapter/${item.chapterSlug}`}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Lanjut Baca</span>
                    </Link>

                    <button
                      onClick={() => removeHistory(item.comicSlug)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Hapus dari riwayat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default LibraryPage;
