import React, { createContext, useContext, useState, useEffect } from 'react';

const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('komik_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('komik_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('komik_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem('komik_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Toggle Bookmark
  const toggleBookmark = (comic) => {
    setBookmarks(prev => {
      const exists = prev.some(item => item.slug === comic.slug);
      if (exists) {
        return prev.filter(item => item.slug !== comic.slug);
      } else {
        return [{
          slug: comic.slug,
          title: comic.title,
          thumbnail: comic.thumbnail,
          type: comic.type,
          latestChapter: comic.latestChapter || '',
          rating: comic.rating || '8.5',
          addedAt: new Date().toISOString()
        }, ...prev];
      }
    });
  };

  const isBookmarked = (slug) => {
    return bookmarks.some(item => item.slug === slug);
  };

  // Add / Update Reading History
  const saveReadingProgress = ({ comicSlug, comicTitle, comicThumbnail, chapterSlug, chapterTitle, pageIndex = 1, totalPages = 1 }) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.comicSlug !== comicSlug);
      const newEntry = {
        comicSlug,
        comicTitle,
        comicThumbnail,
        chapterSlug,
        chapterTitle,
        pageIndex,
        totalPages,
        progressPercent: Math.round((pageIndex / Math.max(totalPages, 1)) * 100),
        readAt: new Date().toISOString()
      };
      return [newEntry, ...filtered].slice(0, 50); // keep up to 50 items
    });
  };

  const getComicHistory = (comicSlug) => {
    return history.find(item => item.comicSlug === comicSlug) || null;
  };

  const removeHistory = (comicSlug) => {
    setHistory(prev => prev.filter(item => item.comicSlug !== comicSlug));
  };

  const clearAllHistory = () => {
    setHistory([]);
  };

  return (
    <LibraryContext.Provider value={{
      bookmarks,
      history,
      toggleBookmark,
      isBookmarked,
      saveReadingProgress,
      getComicHistory,
      removeHistory,
      clearAllHistory
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
