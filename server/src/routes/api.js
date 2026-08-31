import { Router } from 'express';
import axios from 'axios';
import {
  getHome,
  getComics,
  searchComics,
  getComicDetail,
  getChapterImages
} from '../services/komikindoScraper.js';
import { getOrSetCache } from '../services/cacheService.js';

const router = Router();

// GET /api/home (Hero banner, popular, latest updates)
router.get('/home', async (req, res) => {
  try {
    const data = await getOrSetCache('home_data', () => getHome(), 300); // 5 mins cache
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in /api/home:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data beranda', error: error.message });
  }
});

// GET /api/comics?type=manga|manhwa|manhua|all&page=1&sort=latest|popular
router.get('/comics', async (req, res) => {
  try {
    const { type = 'all', page = 1, sort = 'latest' } = req.query;
    const cacheKey = `comics_${type}_${page}_${sort}`;
    const data = await getOrSetCache(cacheKey, () => getComics({ type, page, sort }), 300);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in /api/comics:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar komik', error: error.message });
  }
});

// GET /api/search?q=keyword&page=1
router.get('/search', async (req, res) => {
  try {
    const { q = '', page = 1 } = req.query;
    if (!q.trim()) {
      return res.json({ success: true, data: { results: [], query: '', currentPage: 1, hasNextPage: false } });
    }
    const cacheKey = `search_${q.toLowerCase().trim()}_${page}`;
    const data = await getOrSetCache(cacheKey, () => searchComics(q, page), 600);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in /api/search:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mencari komik', error: error.message });
  }
});

// GET /api/comic/:slug (Comic metadata & chapters)
router.get('/comic/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `comic_detail_${slug}`;
    const data = await getOrSetCache(cacheKey, () => getComicDetail(slug), 600);
    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error in /api/comic/${req.params.slug}:`, error.message);
    res.status(500).json({ success: false, message: 'Gagal memuat detail komik', error: error.message });
  }
});

// GET /api/chapter/:slug (Chapter images & navigation)
router.get('/chapter/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `chapter_images_${slug}`;
    const data = await getOrSetCache(cacheKey, () => getChapterImages(slug), 1800); // 30 mins cache
    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error in /api/chapter/${req.params.slug}:`, error.message);
    res.status(500).json({ success: false, message: 'Gagal memuat chapter gambar', error: error.message });
  }
});

// GET /api/proxy-image?url=... (Bypass hotlink & CORS restrictions)
router.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send('Missing url parameter');
    }

    const decodedUrl = decodeURIComponent(url);
    const response = await axios.get(decodedUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://komikindo.tv/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('Image proxy error:', error.message);
    return res.status(500).send('Failed to load image');
  }
});

export default router;
