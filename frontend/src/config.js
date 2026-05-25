// API base URL resolution:
// - On Vercel: set VITE_API_URL=https://your-render-backend.onrender.com in Vercel env vars
// - On local dev: uses http://localhost:5000
// - On production domain (agsharjah.org/new): uses relative /new path
const getProductionApiBase = () => {
  const onProductionDomain = window.location.hostname.includes('agsharjah.org');
  return onProductionDomain ? '/new' : 'https://agsharjah.org/new';
};

export const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:5000' : getProductionApiBase());

