import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows process.env.API_KEY to work in the browser for local development
    // Ensure you create a .env file with VITE_API_KEY if you change this strategy,
    // but for now, we map it for compatibility with the existing code structure.
    'process.env': {}
  }
})