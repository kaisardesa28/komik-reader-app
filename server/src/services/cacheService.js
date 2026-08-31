import NodeCache from 'node-cache';

// Cache with default TTL of 10 minutes (600s), check period 2 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });

export const getOrSetCache = async (key, fetcher, ttl = 600) => {
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData;
  }

  const freshData = await fetcher();
  if (freshData) {
    cache.set(key, freshData, ttl);
  }
  return freshData;
};

export const clearCache = (key) => {
  if (key) {
    cache.del(key);
  } else {
    cache.flushAll();
  }
};

export default cache;
