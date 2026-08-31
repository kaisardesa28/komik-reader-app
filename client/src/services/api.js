import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export const fetchHome = async () => {
  const res = await api.get('/home');
  return res.data.data;
};

export const fetchComics = async ({ type = 'all', status = 'all', genre = 'all', sort = 'latest', page = 1 } = {}) => {
  const res = await api.get('/comics', {
    params: { type, status, genre, sort, page }
  });
  return res.data.data;
};

export const searchComics = async (query = '', page = 1) => {
  const res = await api.get('/search', {
    params: { q: query, page }
  });
  return res.data.data;
};

export const fetchComicDetail = async (slug) => {
  const res = await api.get(`/comic/${slug}`);
  return res.data.data;
};

export const fetchChapterImages = async (slug) => {
  const res = await api.get(`/chapter/${slug}`);
  return res.data.data;
};

export const getProxiedImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/api') || url.startsWith('data:')) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

export default api;
