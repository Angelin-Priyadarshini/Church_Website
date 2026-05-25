// Frontend and backend are served from the same Hostinger server/domain.
// In production, API_BASE is '' (empty string) = same-origin relative paths.
// No CORS issues, no cross-domain complexity.
export const API_BASE = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  
  // Detect if url is a dynamically uploaded resource on the backend
  const isUploaded = url.startsWith('/resources/') || (url.startsWith('/images/') && /^\/images\/\d+_/.test(url));
  
  if (isUploaded) {
    // Prepends API_BASE only if set (e.g. in local dev: http://localhost:5000/resources/...)
    // In production on Hostinger this is just '/resources/...' (same origin)
    return `${API_BASE}${url}`;
  }
  return url;
};
