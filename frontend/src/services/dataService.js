import staticData from '../data/paimana_data.json';

let cachedData = staticData;

export const getData = async () => {
  if (cachedData) return cachedData;
  try {
    const res = await fetch('/data/paimana_data.json');
    if (res.ok) {
      cachedData = await res.json();
      return cachedData;
    }
  } catch (err) {
    console.warn('Failed to fetch /data/paimana_data.json, falling back to static import', err);
  }
  cachedData = staticData;
  return cachedData;
};

export const getSyncData = () => {
  return cachedData || staticData;
};
