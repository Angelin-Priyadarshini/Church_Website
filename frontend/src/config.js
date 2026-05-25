// Centralized API configuration for AGSTC Website
// Defaults to local Express server, but adapts automatically via environment variables
export const API_BASE = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:5000' : (window.location.pathname.startsWith('/new') ? '/new' : ''));

