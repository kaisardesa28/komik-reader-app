import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  History, 
  Flame, 
  Compass, 
  Home, 
  Layers,
  Menu,
  X,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { bookmarks } = useLibrary();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Beranda', icon: Home },
    { to: '/browse?type=manhwa', label: 'Manhwa', badge: 'Hot' },
    { to: '/browse?type=manhua', label: 'Manhua' },
    { to: '/browse?type=manga', label: 'Manga' },
    { to: '/browse?status=tamat', label: 'Tamat', icon: CheckCircle2, badge: 'End' },
    { to: '/browse?sort=popular', label: 'Populer', icon: Flame },
    { to: '/koleksi', label: 'Koleksi', icon: Bookmark, badgeCount: bookmarks.length },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  Komik<span className="text-indigo-400">ID</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold text-indigo-400/80 ml-1.5 px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40">
                  Sub Indo
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 relative ${
                      isActive 
                        ? 'text-white bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                      link.badge === 'End'
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                  {link.badgeCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500 text-white ml-0.5">
                      {link.badgeCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="flex items-center gap-2 flex-1 max-w-xs sm:max-w-sm">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Cari komik, manga, manhwa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#0c0e17] px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive 
                      ? 'text-indigo-400 bg-indigo-600/10' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  {link.icon && <link.icon className="w-5 h-5 text-indigo-400" />}
                  <span>{link.label}</span>
                </div>
                {link.badgeCount > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    {link.badgeCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e17]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 text-[11px] font-medium transition-colors ${
              isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Beranda</span>
        </NavLink>

        <NavLink
          to="/browse"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 text-[11px] font-medium transition-colors ${
              isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Jelajah</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 text-[11px] font-medium transition-colors ${
              isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Cari</span>
        </NavLink>

        <NavLink
          to="/koleksi"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 text-[11px] font-medium relative transition-colors ${
              isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Bookmark className="w-5 h-5 mb-0.5" />
          <span>Koleksi</span>
          {bookmarks.length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-indigo-500"></span>
          )}
        </NavLink>
      </nav>
    </>
  );
};

export default Navbar;
