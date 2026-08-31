import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, ShieldAlert } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#07080c] pb-20 md:pb-8 pt-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Komik<span className="text-indigo-400">ID</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Platform baca komik, manga, manhwa, dan manhua online terjemahan Bahasa Indonesia terlengkap. Update cepat setiap hari, gratis, dan tanpa ribet.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Kategori Populer</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/browse?type=manhwa" className="hover:text-indigo-400 transition-colors">Baca Manhwa Sub Indo</Link></li>
              <li><Link to="/browse?type=manhua" className="hover:text-indigo-400 transition-colors">Baca Manhua Sub Indo</Link></li>
              <li><Link to="/browse?type=manga" className="hover:text-indigo-400 transition-colors">Baca Manga Sub Indo</Link></li>
              <li><Link to="/browse?sort=popular" className="hover:text-indigo-400 transition-colors">Komik Populer Minggu Ini</Link></li>
            </ul>
          </div>

          {/* User Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Fitur Pengguna</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/koleksi" className="hover:text-indigo-400 transition-colors">Komik Favorit (Bookmark)</Link></li>
              <li><Link to="/koleksi" className="hover:text-indigo-400 transition-colors">Riwayat Bacaan (History)</Link></li>
              <li><Link to="/search" className="hover:text-indigo-400 transition-colors">Pencarian Komik</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-center md:text-left">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500/80 flex-shrink-0" />
            <span>Semua komik di situs ini adalah properti dari penerbit, pemilik hak cipta, dan komikus aslinya.</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Dibuat dengan</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>untuk Komunitas Komik Indonesia © {new Date().getFullYear()} KomikID</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
