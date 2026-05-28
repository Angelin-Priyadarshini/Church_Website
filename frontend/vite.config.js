import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base path is always '/new/' for production (Hostinger deployment at agstc.org/new)
// For Vercel previews, set VITE_BASE='/' in Vercel environment variables
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL === '1' ? '/' : (process.env.VITE_BASE || '/new/'),
})
