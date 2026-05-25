import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base path is '/' for production (Hostinger deployment at agstc.org root)
// Override with VITE_BASE env var if needed (e.g. VITE_BASE=/subfolder/)
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
