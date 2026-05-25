const getProductionApiBase = () => {
  const isHostinger = window.location.pathname.startsWith('/new') || window.location.hostname.includes('agstc.org');
  return isHostinger ? '/new' : 'https://agstc.org/new';
};

export const API_BASE = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:5000' : getProductionApiBase());

