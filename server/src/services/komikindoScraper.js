import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://komikindo.tv';
const FALLBACK_URL = 'https://komikindo.ch';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  }
});

// Helper to extract clean slug from any url
export const extractSlug = (url = '') => {
  if (!url) return '';
  const cleaned = url.replace(BASE_URL, '').replace(FALLBACK_URL, '').replace(/\/+$/, '');
  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts[0] === 'komik' && parts[1]) return parts[1];
  return parts[parts.length - 1];
};

// Helper to extract comic card from animepost element
const parseAnimepost = ($, el) => {
  const item = $(el);
  const anchor = item.find('a').first();
  const rawHref = anchor.attr('href') || '';
  const slug = extractSlug(rawHref);
  
  const titleEl = item.find('.tt h3, .tt h4, h3, h4').first();
  let title = titleEl.text().trim();
  if (!title) {
    title = anchor.attr('title') || anchor.attr('alt') || slug.replace(/-/g, ' ');
  }
  title = title.replace(/^Komik\s+/i, '');

  const imgEl = item.find('img').first();
  const thumbnail = imgEl.attr('src') || imgEl.attr('data-src') || '';

  const typeFlag = item.find('.typeflag, .type').first().attr('class') || '';
  let type = 'Manga';
  if (/manhwa/i.test(typeFlag) || /manhwa/i.test(item.text())) type = 'Manhwa';
  else if (/manhua/i.test(typeFlag) || /manhua/i.test(item.text())) type = 'Manhua';

  const score = item.find('.rating i, .score, .numscore').text().trim() || '8.5';
  
  const lschEl = item.find('.lsch a, .lsch').first();
  const latestChapter = lschEl.find('a').text().trim() || lschEl.text().trim() || '';
  const chapterUrl = lschEl.find('a').attr('href') || '';
  const chapterSlug = extractSlug(chapterUrl);
  
  const dateEl = item.find('.datech, .date').first().text().trim();

  return {
    title,
    slug,
    thumbnail,
    type,
    score,
    latestChapter: latestChapter ? latestChapter.replace(/\s+/g, ' ') : 'Ch. 1',
    chapterSlug,
    updatedOn: dateEl || 'Baru'
  };
};

/**
 * Get Home Data (Featured, Trending/Popular, Latest updates)
 */
export const getHome = async () => {
  const res = await client.get('/');
  const $ = cheerio.load(res.data);

  // Parse Popular / Top
  const popular = [];
  $('.populer, #tab-populer, .wpop-weekly, .serieslist.pop').first().find('.animepost, li').each((i, el) => {
    if (i < 10) {
      const parsed = parseAnimepost($, el);
      if (parsed.slug) popular.push(parsed);
    }
  });

  // If sidebar popular was structured differently, fallback to main cards
  if (popular.length === 0) {
    $('.animepost').slice(0, 8).each((i, el) => {
      const parsed = parseAnimepost($, el);
      if (parsed.slug) popular.push(parsed);
    });
  }

  // Parse Latest Updates
  const latest = [];
  $('.listupd .animepost, .animepost').each((i, el) => {
    const parsed = parseAnimepost($, el);
    if (parsed.slug && !latest.some(item => item.slug === parsed.slug)) {
      latest.push(parsed);
    }
  });

  // Featured banners (pick top 5 popular with good images)
  const featured = popular.slice(0, 5).map(item => ({
    ...item,
    banner: item.thumbnail,
    synopsis: 'Komik terjemahan Bahasa Indonesia terbaik dengan update chapter terbaru dan kualitas gambar HD.'
  }));

  return {
    featured,
    popular: popular.slice(0, 10),
    latest: latest.slice(0, 30)
  };
};

/**
 * Get Comics List with pagination and filter (type: all | manga | manhwa | manhua | popular)
 */
export const getComics = async ({ type = 'all', page = 1, sort = 'latest' } = {}) => {
  let path = '/komik-terbaru/';
  if (type === 'manhwa') path = `/manhwa/`;
  else if (type === 'manhua') path = `/manhua/`;
  else if (type === 'manga') path = `/manga/`;
  else if (sort === 'popular') path = `/komik-populer/`;

  if (page > 1) {
    path += `page/${page}/`;
  }

  const res = await client.get(path);
  const $ = cheerio.load(res.data);

  const comics = [];
  $('.animepost').each((_, el) => {
    const parsed = parseAnimepost($, el);
    if (parsed.slug) comics.push(parsed);
  });

  const hasNextPage = $('.pagination .next, .nav-links .next, .pagination a:contains("Berikutnya"), .pagination a:contains("»")').length > 0;
  const currentPage = parseInt(page, 10) || 1;

  return {
    currentPage,
    hasNextPage,
    comics
  };
};

/**
 * Search Comics by keyword
 */
export const searchComics = async (query = '', page = 1) => {
  const cleanQ = encodeURIComponent(query.trim());
  let path = `/?s=${cleanQ}`;
  if (page > 1) {
    path = `/page/${page}/?s=${cleanQ}`;
  }

  const res = await client.get(path);
  const $ = cheerio.load(res.data);

  const results = [];
  $('.animepost').each((_, el) => {
    const parsed = parseAnimepost($, el);
    if (parsed.slug) results.push(parsed);
  });

  const hasNextPage = $('.pagination .next, .nav-links .next').length > 0;

  return {
    query,
    currentPage: parseInt(page, 10) || 1,
    hasNextPage,
    totalResults: results.length,
    results
  };
};

/**
 * Get Full Comic Detail (Metadata, Genres, Synopsis, and Chapter List)
 */
export const getComicDetail = async (slug) => {
  const res = await client.get(`/komik/${slug}/`);
  const $ = cheerio.load(res.data);

  let title = $('.entry-title, .infoanime h1').first().text().trim();
  title = title.replace(/^Komik\s+/i, '');

  const thumbnail = $('.thumb img').first().attr('src') || $('.thumb img').first().attr('data-src') || '';
  
  // Extract info from .spe / .infox
  let status = 'Ongoing';
  let author = 'Anonim';
  let type = 'Manga';
  let releaseYear = '-';
  let rating = $('.rating strong, .score').text().trim() || '8.5';

  $('.spe span').each((_, el) => {
    const text = $(el).text();
    if (/Status/i.test(text)) status = text.split(':').slice(1).join(':').trim();
    if (/Pengarang|Author/i.test(text)) author = text.split(':').slice(1).join(':').trim();
    if (/Jenis Komik|Tipe|Type/i.test(text)) type = text.split(':').slice(1).join(':').trim();
    if (/Rilis|Released/i.test(text)) releaseYear = text.split(':').slice(1).join(':').trim();
  });

  // Extract genres
  const genres = [];
  $('.genre-info a, .genre a, .spe a[href*="/genres/"]').each((_, el) => {
    const name = $(el).text().trim();
    const gSlug = extractSlug($(el).attr('href') || '');
    if (name && !genres.some(g => g.name === name)) {
      genres.push({ name, slug: gSlug });
    }
  });

  // Extract Synopsis
  let synopsis = $('.entry-content-single p, .sin p, .entry-content p')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .join('\n\n');

  if (!synopsis) {
    synopsis = 'Tidak ada sinopsis tersedia untuk komik ini.';
  }

  // Extract Chapters
  const chapters = [];
  $('.chapter-list li, #chapter_list li, ul.cl li').each((_, el) => {
    const a = $(el).find('.lchx a, a').first();
    const chTitle = a.text().trim().replace(/\s+/g, ' ');
    const chUrl = a.attr('href') || '';
    const chSlug = extractSlug(chUrl);
    const date = $(el).find('.dt a, .dt, span.right').text().trim();

    if (chSlug) {
      chapters.push({
        title: chTitle || chSlug.replace(/-/g, ' '),
        slug: chSlug,
        date: date || ''
      });
    }
  });

  return {
    title,
    slug,
    thumbnail,
    status,
    author,
    type,
    releaseYear,
    rating,
    genres,
    synopsis,
    totalChapters: chapters.length,
    chapters
  };
};

/**
 * Get Chapter Pages/Images and navigation info
 */
export const getChapterImages = async (slug) => {
  const res = await client.get(`/${slug}/`);
  const $ = cheerio.load(res.data);

  const title = $('h1.entry-title').first().text().trim().replace(/^Komik\s+/i, '');

  // Find Comic slug and title from link
  let comicSlug = '';
  let comicTitle = '';
  $('a[href*="/komik/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('/komik/')) {
      comicSlug = extractSlug(href);
      comicTitle = $(el).text().trim() || comicSlug.replace(/-/g, ' ');
    }
  });

  // Navigation: Prev & Next chapter
  let prevChapterSlug = null;
  let nextChapterSlug = null;

  $('.nextprev a, .navl a').each((_, el) => {
    const rel = $(el).attr('rel');
    const href = $(el).attr('href') || '';
    const text = $(el).text();
    const chSlug = extractSlug(href);

    if (rel === 'prev' || /Sebelumnya|prev/i.test(text)) {
      if (chSlug && !chSlug.includes('komik')) prevChapterSlug = chSlug;
    } else if (rel === 'next' || /Selanjutnya|next/i.test(text)) {
      if (chSlug && !chSlug.includes('komik')) nextChapterSlug = chSlug;
    }
  });

  // Extract all images
  const images = [];
  $('#chimg-auh img, #readerarea img, .chapter-image img').each((i, el) => {
    let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src') || '';
    src = src.trim();
    if (src && !src.includes('data:image') && !src.endsWith('.gif') && !src.includes('lazy.jpg')) {
      images.push({
        index: images.length + 1,
        url: src
      });
    }
  });

  return {
    chapterTitle: title,
    slug,
    comicSlug,
    comicTitle,
    prevChapterSlug,
    nextChapterSlug,
    totalImages: images.length,
    images
  };
};
