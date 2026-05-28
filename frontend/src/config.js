const getProductionApiBase = () => {
  const isHostinger = window.location.pathname.startsWith('/new') || window.location.hostname.includes('agsharjah.org');
  return isHostinger ? '/new' : 'https://agsharjah.org/new';
};

// Use VITE_API_URL only if it's actually set to a non-empty value
const envApiUrl = import.meta.env.VITE_API_URL;
const hasExplicitApiUrl = envApiUrl && envApiUrl.trim() !== '';
const isLocalApiUrl = hasExplicitApiUrl && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(envApiUrl.trim());

export const API_BASE = (hasExplicitApiUrl && (import.meta.env.DEV || !isLocalApiUrl))
  ? envApiUrl.trim()
  : (import.meta.env.DEV ? 'http://localhost:5000' : getProductionApiBase());

// Checks if a path represents a valid image file location (frontend asset or backend upload)
export const isValidImagePath = (path) => {
  if (!path) return false;
  const p = path.trim().toLowerCase();
  return p.startsWith('/images/') || p.startsWith('images/') || p.startsWith('/uploads/') || p.startsWith('uploads/') || p.startsWith('http');
};

// Resolves an image/resource path to a full URL via the API base or local frontend path
export const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If it's a frontend static image, resolve it relative to the frontend base path
  if (cleanPath.startsWith('/images/')) {
    const isHostinger = window.location.pathname.startsWith('/new') || window.location.hostname.includes('agsharjah.org');
    return isHostinger ? `/new${cleanPath}` : cleanPath;
  }
  
  // Otherwise, it's a backend dynamic asset (like /uploads/)
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  return `${base}${cleanPath}`;
};
