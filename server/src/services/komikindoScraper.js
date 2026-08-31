import * as cheerio from 'cheerio';

const KOMIKU_BASE = 'https://komiku.org';
const KOMIKINDO_BASE = 'https://komikindo.tv';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

const fetchHtml = async (url) => {
  const res = await fetch(url, {
    headers: DEFAULT_HEADERS,
    signal: AbortSignal.timeout(12000)
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }
  return await res.text();
};

export const extractSlug = (url = '') => {
  if (!url) return '';
  const cleaned = url.replace(KOMIKINDO_BASE, '').replace(KOMIKU_BASE, '').replace(/\/+$/, '');
  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts[0] === 'manga' || parts[0] === 'komik') return parts[1] || parts[0];
  return parts[parts.length - 1];
};

// ==========================================
// 1. KOMIKU SCRAPING (Primary & Resilient)
// ==========================================

const getHomeFromKomiku = async () => {
  const html = await fetchHtml(KOMIKU_BASE);
  const $ = cheerio.load(html);

  const featured = [];
  const popular = [];
  const latest = [];

  // Parse Popular / Top
  $('.ls4, .ls2, .ls12').each((i, el) => {
    const a = $(el).find('h4 a, h3 a, a.populer').first();
    const img = $(el).find('img').first();
    const rawHref = a.attr('href') || $(el).find('a').first().attr('href') || '';
    const slug = extractSlug(rawHref);
    const title = a.text().trim() || slug.replace(/-/g, ' ');
    const thumbnail = img.attr('data-src') || img.attr('src') || '';
    const lsch = $(el).find('.ls24, .ls4s').first().text().trim();

    if (slug && title && !popular.some(p => p.slug === slug)) {
      const type = /manhwa/i.test(slug + ' ' + title) ? 'Manhwa' : /manhua/i.test(slug + ' ' + title) ? 'Manhua' : 'Manga';
      popular.push({
        title,
        slug,
        thumbnail,
        type,
        score: '8.8',
        latestChapter: lsch.split('•')[0].trim() || 'Ch. Baru',
        chapterSlug: slug,
        updatedOn: 'Hari Ini'
      });
    }
  });

  // Parse Latest Updates
  $('.ls4j, .ls2j, .ls2, .ls4').each((_, el) => {
    const a = $(el).find('h4 a, h3 a').first();
    const link = $(el).find('a').first();
    const img = $(el).find('img').first();
    const lsch = $(el).find('.ls24').first().text().trim();
    const rawHref = a.attr('href') || link.attr('href') || '';
    const slug = extractSlug(rawHref);
    const title = a.text().trim() || slug.replace(/-/g, ' ');
    const thumbnail = img.attr('data-src') || img.attr('src') || '';

    if (slug && title && !latest.some(l => l.slug === slug)) {
      const type = /manhwa/i.test(slug + ' ' + title) ? 'Manhwa' : /manhua/i.test(slug + ' ' + title) ? 'Manhua' : 'Manga';
      latest.push({
        title,
        slug,
        thumbnail,
        type,
        score: '8.6',
        latestChapter: lsch || 'Ch. Terbaru',
        chapterSlug: slug,
        updatedOn: 'Baru'
      });
    }
  });

  // Featured Banner List
  const topList = popular.length > 0 ? popular : latest;
  topList.slice(0, 5).forEach((item) => {
    featured.push({
      ...item,
      synopsis: 'Komik terjemahan Bahasa Indonesia lengkap dengan kualitas gambar HD dan rilis chapter terbaru setiap hari.'
    });
  });

  return {
    featured,
    popular: popular.slice(0, 10),
    latest: latest.slice(0, 36)
  };
};

const getComicsFromKomiku = async ({ type = 'all', page = 1, sort = 'latest' } = {}) => {
  let url = `${KOMIKU_BASE}/pustaka/`;
  if (type === 'manhwa') url += '?tipe=manhwa';
  else if (type === 'manhua') url += '?tipe=manhua';
  else if (type === 'manga') url += '?tipe=manga';
  else if (sort === 'popular') url += '?orderby=popularity';
  else url += '?orderby=date';

  if (page > 1) {
    url += `&page=${page}`;
  }

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const comics = [];
  $('.bge, .ls4, .ls2, .list-manga article').each((_, el) => {
    const a = $(el).find('h3 a, h4 a, a').first();
    const img = $(el).find('img').first();
    const rawHref = a.attr('href') || '';
    const slug = extractSlug(rawHref);
    const title = $(el).find('h3, h4').first().text().trim() || a.text().trim();
    const thumbnail = img.attr('data-src') || img.attr('src') || '';
    const lsch = $(el).find('.ls24, .tpe1_inf, .kan').first().text().trim();

    if (slug && title) {
      const cType = type !== 'all' ? (type.charAt(0).toUpperCase() + type.slice(1)) : (/manhwa/i.test(slug) ? 'Manhwa' : /manhua/i.test(slug) ? 'Manhua' : 'Manga');
      comics.push({
        title,
        slug,
        thumbnail,
        type: cType,
        score: '8.7',
        latestChapter: lsch ? lsch.slice(0, 20) : 'Ch. Baru',
        chapterSlug: slug,
        updatedOn: 'Baru'
      });
    }
  });

  return {
    currentPage: parseInt(page, 10) || 1,
    hasNextPage: comics.length >= 10,
    comics
  };
};

const searchFromKomiku = async (query = '', page = 1) => {
  const url = `https://api.komiku.org/?post_type=manga&s=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const results = [];
  $('.bge').each((_, el) => {
    const a = $(el).find('h3 a, a').first();
    const img = $(el).find('img').first();
    const title = $(el).find('h3').first().text().trim();
    const rawHref = a.attr('href') || '';
    const slug = extractSlug(rawHref);
    const thumbnail = img.attr('data-src') || img.attr('src') || '';
    const desc = $(el).find('p').first().text().trim();

    if (slug && title) {
      results.push({
        title,
        slug,
        thumbnail,
        type: /manhwa/i.test(slug + ' ' + title) ? 'Manhwa' : /manhua/i.test(slug + ' ' + title) ? 'Manhua' : 'Manga',
        score: '8.8',
        latestChapter: desc || 'Ch. Baru',
        chapterSlug: slug,
        updatedOn: 'Baru'
      });
    }
  });

  return {
    query,
    currentPage: parseInt(page, 10) || 1,
    hasNextPage: false,
    totalResults: results.length,
    results
  };
};

const getDetailFromKomiku = async (slug) => {
  const url = `${KOMIKU_BASE}/manga/${slug}/`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  let title = $('h1').first().text().trim().replace(/^Komik\s+/i, '');
  const thumbnail = $('.ims img').first().attr('src') || $('.ims img').first().attr('data-src') || '';
  const synopsis = $('p.desc').first().text().trim() || 'Komik terjemahan Bahasa Indonesia lengkap.';

  let author = 'Anonim';
  let status = 'Ongoing';
  let type = 'Manga';
  let releaseYear = '2024';

  $('.inftable tr, .spe span').each((_, el) => {
    const text = $(el).text();
    if (/Pengarang|Author/i.test(text)) author = text.split(':').slice(1).join(':').trim() || author;
    if (/Status/i.test(text)) status = text.split(':').slice(1).join(':').trim() || status;
    if (/Jenis|Tipe|Type/i.test(text)) type = text.split(':').slice(1).join(':').trim() || type;
  });

  const genres = [];
  $('ul.genre li a, .genre-info a, a[href*="/genre/"]').each((_, el) => {
    const name = $(el).text().trim();
    if (name && !genres.some(g => g.name === name)) {
      genres.push({ name, slug: extractSlug($(el).attr('href')) });
    }
  });

  const chapters = [];
  $('table#Daftar_Chapter tr, table.tbl tr').each((_, tr) => {
    const a = $(tr).find('td.judulseries a, a').first();
    const date = $(tr).find('td.tanggalseries, .dt').first().text().trim();
    const rawHref = a.attr('href') || '';
    const chSlug = extractSlug(rawHref);
    const chTitle = a.text().trim();

    if (chSlug && chTitle) {
      chapters.push({
        title: chTitle,
        slug: chSlug,
        date: date || 'Rilis'
      });
    }
  });

  return {
    title: title || slug.replace(/-/g, ' '),
    slug,
    thumbnail,
    status,
    author,
    type,
    releaseYear,
    rating: '9.0',
    genres,
    synopsis,
    totalChapters: chapters.length,
    chapters
  };
};

const getChapterImagesFromKomiku = async (slug) => {
  const url = `${KOMIKU_BASE}/${slug}/`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  let title = $('h1').first().text().trim().replace(/^Komik\s+/i, '');

  let comicSlug = '';
  let comicTitle = '';
  $('a[href*="/manga/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('/manga/')) {
      comicSlug = extractSlug(href);
      comicTitle = $(el).text().trim();
    }
  });

  let prevChapterSlug = null;
  let nextChapterSlug = null;

  $('a[rel="prev"], a:contains("Sebelumnya")').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href && !href.includes('/manga/')) prevChapterSlug = extractSlug(href);
  });

  $('a[rel="next"], a:contains("Selanjutnya"), a:contains("Berikutnya")').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href && !href.includes('/manga/')) nextChapterSlug = extractSlug(href);
  });

  const images = [];
  $('#Baca_Komik img, .chapter-image img, #chimg-auh img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (src && !src.includes('promosi') && !src.includes('lazy.jpg')) {
      images.push({
        index: images.length + 1,
        url: src.trim()
      });
    }
  });

  return {
    chapterTitle: title || slug.replace(/-/g, ' '),
    slug,
    comicSlug: comicSlug || slug.split('-chapter-')[0],
    comicTitle: comicTitle || 'Komik Sub Indo',
    prevChapterSlug,
    nextChapterSlug,
    totalImages: images.length,
    images
  };
};

// ==========================================
// 2. EXPORT FUNCTIONS
// ==========================================

export const getHome = async () => {
  return await getHomeFromKomiku();
};

export const getComics = async (params) => {
  return await getComicsFromKomiku(params);
};

export const searchComics = async (query = '', page = 1) => {
  return await searchFromKomiku(query, page);
};

export const getComicDetail = async (slug) => {
  return await getDetailFromKomiku(slug);
};

export const getChapterImages = async (slug) => {
  return await getChapterImagesFromKomiku(slug);
};
