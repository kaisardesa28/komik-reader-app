import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import SearchPage from './pages/SearchPage';
import DetailPage from './pages/DetailPage';
import ReaderPage from './pages/ReaderPage';
import LibraryPage from './pages/LibraryPage';

function App() {
  const location = useLocation();
  const isReaderPage = location.pathname.startsWith('/chapter/');

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100">
      {/* Top and Mobile Navbar (Hidden inside Reader for full immersion) */}
      {!isReaderPage && <Navbar />}

      {/* Main Content View */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/komik/:slug" element={<DetailPage />} />
          <Route path="/chapter/:slug" element={<ReaderPage />} />
          <Route path="/koleksi" element={<LibraryPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>

      {/* Footer (Hidden inside Reader) */}
      {!isReaderPage && <Footer />}
    </div>
  );
}

export default App;
