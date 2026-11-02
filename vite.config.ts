import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the Capacitor WebView can load bundled assets from disk.
export default defineConfig({
  base: './',
  plugins: [react()],
})
