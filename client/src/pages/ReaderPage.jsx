import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  ArrowLeft, 
  BookOpen, 
  Maximize, 
  Minimize, 
  ArrowUp,
  List,
  Sliders,
  Check,
  RefreshCw
} from 'lucide-react';
import { fetchChapterImages, fetchComicDetail, getProxiedImageUrl } from '../services/api';
import { useLibrary } from '../context/LibraryContext';
import { ReaderSkeleton } from '../components/SkeletonLoader';

const ReaderPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { saveReadingProgress } = useLibrary();

  const [chapterData, setChapterData] = useState(null);
  const [comicDetail, setComicDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reader Settings
  const [readerMode, setReaderMode] = useState(() => localStorage.getItem('komik_reader_mode') || 'webtoon'); // 'webtoon' | 'single'
  const [readerWidth, setReaderWidth] = useState(() => localStorage.getItem('komik_reader_width') || '800'); // '650' | '800' | '1000' | 'full'
  const [readerBg, setReaderBg] = useState(() => localStorage.getItem('komik_reader_bg') || 'dark'); // 'black' | 'dark' | 'sepia'
  
  // Page index for Single Page Mode
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Modals & UI States
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chapterListOpen, setChapterListOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);

  // Load Chapter Data
  useEffect(() => {
    const loadChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0 });
        setCurrentPageIndex(0);

        const data = await fetchChapterImages(slug);
        setChapterData(data);

        // Fetch comic details for chapter switcher list
        if (data.comicSlug) {
          const detail = await fetchComicDetail(data.comicSlug);
          setComicDetail(detail);
          
          // Save progress
          saveReadingProgress({
            comicSlug: data.comicSlug,
            comicTitle: detail.title || data.comicTitle || 'Komik',
            comicThumbnail: detail.thumbnail || '',
            chapterSlug: slug,
            chapterTitle: data.chapterTitle || slug,
            pageIndex: 1,
            totalPages: data.images?.length || 1
          });
        }
      } catch (err) {
        console.error('Failed to load chapter', err);
        setError('Gagal memuat halaman chapter. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [slug]);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('komik_reader_mode', readerMode);
  }, [readerMode]);

  useEffect(() => {
    localStorage.setItem('komik_reader_width', readerWidth);
  }, [readerWidth]);

  useEffect(() => {
    localStorage.setItem('komik_reader_bg', readerBg);
  }, [readerBg]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (readerMode === 'single') {
          handleNextPage();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (readerMode === 'single') {
          handlePrevPage();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        setSettingsOpen(false);
        setChapterListOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readerMode, currentPageIndex, chapterData]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleNextPage = () => {
    if (!chapterData?.images) return;
    if (currentPageIndex < chapterData.images.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (chapterData.nextChapterSlug) {
      navigate(`/chapter/${chapterData.nextChapterSlug}`);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (chapterData?.prevChapterSlug) {
      navigate(`/chapter/${chapterData.prevChapterSlug}`);
    }
  };

  const getBgClass = () => {
    if (readerBg === 'black') return 'bg-black text-white';
    if (readerBg === 'sepia') return 'bg-[#181412] text-[#e6d8c3]';
    return 'bg-[#090a0f] text-slate-100';
  };

  const getWidthClass = () => {
    if (readerWidth === '650') return 'max-w-[650px]';
    if (readerWidth === '800') return 'max-w-[800px]';
    if (readerWidth === '1000') return 'max-w-[1000px]';
    return 'max-w-full';
  };

  if (loading) return <ReaderSkeleton />;

  if (error || !chapterData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3">
          <p className="text-rose-400 font-bold">{error || 'Chapter tidak ditemukan'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const images = chapterData.images || [];

  return (
    <div className={`min-h-screen ${getBgClass()} transition-colors duration-200`} ref={containerRef}>
      
      {/* Top Floating Header Bar */}
      <header className="sticky top-0 z-40 bg-[#090a0f]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Back to Comic */}
          <Link
            to={chapterData.comicSlug ? `/komik/${chapterData.comicSlug}` : '/'}
            className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-xs py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Info Komik</span>
          </Link>

          {/* Chapter Title */}
          <div className="text-center truncate flex-1">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate">
              {chapterData.chapterTitle}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {chapterData.comicTitle || 'Komik Bahasa Indonesia'}
            </p>
          </div>

          {/* Settings & Fullscreen Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setChapterListOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
              title="Daftar Chapter"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
              title="Pengaturan Tampilan"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="hidden sm:block p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
              title="Layar Penuh"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Image Reader Area */}
      <main className="py-4 sm:py-6">
        <div className={`mx-auto px-1 sm:px-2 ${getWidthClass()} transition-all duration-200`}>
          
          {images.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <p className="font-semibold">Tidak ada gambar yang dimuat.</p>
              <p className="text-xs text-slate-500">Mungkin server sumber sedang mengalami kendala.</p>
            </div>
          ) : readerMode === 'webtoon' ? (
            /* Webtoon Mode: Vertical Continuous Scroll */
            <div className="flex flex-col items-center">
              {images.map((img, idx) => (
                <div key={idx} className="w-full relative min-h-[300px] bg-slate-950/40 flex items-center justify-center">
                  <img
                    src={getProxiedImageUrl(img.url)}
                    alt={`Halaman ${idx + 1}`}
                    loading={idx < 4 ? 'eager' : 'lazy'}
                    className="w-full h-auto block select-none"
                    onError={(e) => {
                      // Retry with direct url or proxy
                      if (!e.target.dataset.retried) {
                        e.target.dataset.retried = 'true';
                        e.target.src = img.url;
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Manga Mode: Single Page Navigation */
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="w-full relative min-h-[500px] bg-slate-950 flex items-center justify-center rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                onClick={handleNextPage}
              >
                {images[currentPageIndex] && (
                  <img
                    src={getProxiedImageUrl(images[currentPageIndex].url)}
                    alt={`Halaman ${currentPageIndex + 1}`}
                    className="w-full h-auto max-h-[85vh] object-contain block select-none"
                  />
                )}
              </div>

              {/* Single Page Indicator & Nav */}
              <div className="flex items-center gap-4 py-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPageIndex === 0 && !chapterData.prevChapterSlug}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-200 border border-slate-800"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-xs font-bold text-slate-300">
                  Halaman {currentPageIndex + 1} dari {images.length}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPageIndex === images.length - 1 && !chapterData.nextChapterSlug}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-200 border border-slate-800"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Chapter End Actions & Navigation */}
      <section className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">Selesai Membaca Chapter Ini</h3>
          <p className="text-xs text-slate-400">
            Lanjut ke chapter berikutnya untuk terus mengikuti jalan ceritanya!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {chapterData.prevChapterSlug && (
              <Link
                to={`/chapter/${chapterData.prevChapterSlug}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Chapter Sebelumnya</span>
              </Link>
            )}

            {chapterData.nextChapterSlug ? (
              <Link
                to={`/chapter/${chapterData.nextChapterSlug}`}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <span>Chapter Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-xs font-semibold text-emerald-400 px-4 py-2 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
                Kamu sudah berada di chapter paling baru!
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Floating Bottom Quick Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#12141c]/90 backdrop-blur-xl border border-slate-800 px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2">
        {chapterData.prevChapterSlug ? (
          <Link
            to={`/chapter/${chapterData.prevChapterSlug}`}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
            title="Chapter Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <div className="p-2 text-slate-600 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={() => setChapterListOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="max-w-[120px] sm:max-w-[160px] truncate">
            {chapterData.chapterTitle.replace(/^Komik\s+/i, '')}
          </span>
        </button>

        {chapterData.nextChapterSlug ? (
          <Link
            to={`/chapter/${chapterData.nextChapterSlug}`}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
            title="Chapter Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <div className="p-2 text-slate-600 cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all ml-1"
          title="Scroll ke Atas"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      {/* Reader Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Pengaturan Reader</span>
              </h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Mode: Webtoon vs Manga */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mode Membaca
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setReaderMode('webtoon')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    readerMode === 'webtoon'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Webtoon (Scroll)
                </button>
                <button
                  onClick={() => setReaderMode('single')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    readerMode === 'single'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Manga (Per Halaman)
                </button>
              </div>
            </div>

            {/* Width */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Lebar Tampilan Gambar
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: '650', label: '650px' },
                  { id: '800', label: '800px' },
                  { id: '1000', label: '1000px' },
                  { id: 'full', label: 'Penuh' },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setReaderWidth(w.id)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      readerWidth === w.id
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Latar Belakang
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dark', label: 'Gelap (#090a0f)' },
                  { id: 'black', label: 'Hitam Pekat' },
                  { id: 'sepia', label: 'Sepia' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setReaderBg(bg.id)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border truncate transition-all ${
                      readerBg === bg.id
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      )}

      {/* Chapter Switcher Modal */}
      {chapterListOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <h3 className="font-bold text-white text-base">Daftar Chapter</h3>
                <p className="text-xs text-slate-400 truncate">{chapterData.comicTitle}</p>
              </div>
              <button
                onClick={() => setChapterListOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {comicDetail?.chapters?.map((ch) => {
                const isCurrent = ch.slug === slug;
                return (
                  <button
                    key={ch.slug}
                    onClick={() => {
                      setChapterListOpen(false);
                      navigate(`/chapter/${ch.slug}`);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{ch.title}</span>
                    {isCurrent && <Check className="w-4 h-4 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReaderPage;
