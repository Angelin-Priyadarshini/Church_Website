import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// On Vercel: base='/' (VERCEL env var is auto-set by Vercel)
// On Render / local: base='/new/'
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : '/new/',
})
