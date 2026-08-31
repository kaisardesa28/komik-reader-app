import axios from 'axios';
import * as cheerio from 'cheerio';

const KOMIKINDO_BASE = 'https://komikindo.tv';
const KOMIKU_BASE = 'https://komiku.org';

const browserHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

const client = axios.create({
  timeout: 10000,
  headers: browserHeaders
});

// Helper to extract clean slug
export const extractSlug = (url = '') => {
  if (!url) return '';
  const cleaned = url.replace(KOMIKINDO_BASE, '').replace(KOMIKU_BASE, '').replace(/\/+$/, '');
  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts[0] === 'manga' || parts[0] === 'komik') return parts[1] || parts[0];
  return parts[parts.length - 1];
};

// ==========================================
// 1. KOMIKU SCRAPING FUNCTIONS (Resilient)
// ==========================================

const getHomeFromKomiku = async () => {
  const res = await client.get(KOMIKU_BASE);
  const $ = cheerio.load(res.data);

  const featured = [];
  const popular = [];
  const latest = [];

  // Parse Popular
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

  // Parse Latest
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

  // Featured
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

  const res = await client.get(url);
  const $ = cheerio.load(res.data);

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
  const res = await client.get(url);
  const $ = cheerio.load(res.data);

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
  const res = await client.get(url);
  const $ = cheerio.load(res.data);

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
  const res = await client.get(url);
  const $ = cheerio.load(res.data);

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
// 2. KOMIKINDO SCRAPING FUNCTIONS (Fallback)
// ==========================================

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

const getHomeFromKomikindo = async () => {
  const res = await client.get(`${KOMIKINDO_BASE}/`);
  const $ = cheerio.load(res.data);

  const popular = [];
  $('.animepost').slice(0, 10).each((_, el) => {
    const parsed = parseAnimepost($, el);
    if (parsed.slug) popular.push(parsed);
  });

  const latest = [];
  $('.listupd .animepost, .animepost').each((_, el) => {
    const parsed = parseAnimepost($, el);
    if (parsed.slug && !latest.some(item => item.slug === parsed.slug)) {
      latest.push(parsed);
    }
  });

  const featured = popular.slice(0, 5).map(item => ({
    ...item,
    synopsis: 'Komik terjemahan Bahasa Indonesia terbaik dengan update chapter terbaru dan kualitas gambar HD.'
  }));

  return { featured, popular: popular.slice(0, 10), latest: latest.slice(0, 30) };
};

// ==========================================
// 3. UNIFIED RESILIENT EXPORTS (Auto-fallback)
// ==========================================

export const getHome = async () => {
  try {
    return await getHomeFromKomiku();
  } catch (err) {
    console.warn('Komiku getHome failed, falling back to Komikindo:', err.message);
    return await getHomeFromKomikindo();
  }
};

export const getComics = async (params) => {
  try {
    return await getComicsFromKomiku(params);
  } catch (err) {
    console.warn('Komiku getComics failed, falling back to Komikindo:', err.message);
    const path = `${KOMIKINDO_BASE}/komik-terbaru/page/${params.page || 1}/`;
    const res = await client.get(path);
    const $ = cheerio.load(res.data);
    const comics = [];
    $('.animepost').each((_, el) => {
      const parsed = parseAnimepost($, el);
      if (parsed.slug) comics.push(parsed);
    });
    return { currentPage: params.page || 1, hasNextPage: true, comics };
  }
};

export const searchComics = async (query = '', page = 1) => {
  try {
    return await searchFromKomiku(query, page);
  } catch (err) {
    console.warn('Komiku search failed, falling back to Komikindo:', err.message);
    const res = await client.get(`${KOMIKINDO_BASE}/?s=${encodeURIComponent(query)}`);
    const $ = cheerio.load(res.data);
    const results = [];
    $('.animepost').each((_, el) => {
      const parsed = parseAnimepost($, el);
      if (parsed.slug) results.push(parsed);
    });
    return { query, currentPage: page, hasNextPage: false, totalResults: results.length, results };
  }
};

export const getComicDetail = async (slug) => {
  try {
    return await getDetailFromKomiku(slug);
  } catch (err) {
    console.warn('Komiku detail failed, falling back to Komikindo:', err.message);
    const res = await client.get(`${KOMIKINDO_BASE}/komik/${slug}/`);
    const $ = cheerio.load(res.data);
    let title = $('.entry-title, .infoanime h1').first().text().trim().replace(/^Komik\s+/i, '');
    const thumbnail = $('.thumb img').first().attr('src') || '';
    const synopsis = $('.entry-content-single p, .sin p').first().text().trim() || 'Komik Bahasa Indonesia.';
    const chapters = [];
    $('.chapter-list li, #chapter_list li').each((_, el) => {
      const a = $(el).find('a').first();
      const chSlug = extractSlug(a.attr('href') || '');
      if (chSlug) chapters.push({ title: a.text().trim(), slug: chSlug, date: 'Rilis' });
    });
    return {
      title: title || slug.replace(/-/g, ' '),
      slug,
      thumbnail,
      status: 'Ongoing',
      author: 'Anonim',
      type: 'Manga',
      releaseYear: '2024',
      rating: '8.8',
      genres: [],
      synopsis,
      totalChapters: chapters.length,
      chapters
    };
  }
};

export const getChapterImages = async (slug) => {
  try {
    return await getChapterImagesFromKomiku(slug);
  } catch (err) {
    console.warn('Komiku chapter failed, falling back to Komikindo:', err.message);
    const res = await client.get(`${KOMIKINDO_BASE}/${slug}/`);
    const $ = cheerio.load(res.data);
    const title = $('h1.entry-title').first().text().trim().replace(/^Komik\s+/i, '');
    const images = [];
    $('#chimg-auh img, #readerarea img, .chapter-image img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src && !src.includes('data:image')) images.push({ index: images.length + 1, url: src.trim() });
    });
    return {
      chapterTitle: title || slug,
      slug,
      comicSlug: slug.split('-chapter-')[0],
      comicTitle: 'Komik Sub Indo',
      prevChapterSlug: null,
      nextChapterSlug: null,
      totalImages: images.length,
      images
    };
  }
};
