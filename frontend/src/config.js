// Centralized API configuration for AGSTC Website
// Defaults to local Express server, but adapts automatically via environment variables
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
