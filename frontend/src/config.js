const getProductionApiBase = () => {
  const isHostinger = window.location.pathname.startsWith('/new') || window.location.hostname.includes('agsharjah.org');
  return isHostinger ? '/new' : 'https://agsharjah.org/new';
};

export const API_BASE = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:5000' : getProductionApiBase());

// Resolves an image/resource path to a full URL via the API base
export const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};
