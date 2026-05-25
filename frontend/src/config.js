const getProductionApiBase = () => {
  const isHostinger = window.location.pathname.startsWith('/new') || window.location.hostname.includes('agstc.org');
  return isHostinger ? '/new' : 'https://agstc.org/new';
};

export const API_BASE = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:5000' : getProductionApiBase());

export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  
  // Detect if url is a dynamically uploaded resource on the backend
  const isUploaded = url.startsWith('/resources/') || (url.startsWith('/images/') && /^\/images\/\d+_/.test(url));
  
  if (isUploaded) {
    return `${API_BASE}${url}`;
  }
  return url;
};
