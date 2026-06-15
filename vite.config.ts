import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// sql.js is pre-bundled by Vite (esbuild) so its CommonJS dist gets a proper
// default export. At runtime it fetches /sql-wasm.wasm from /public.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
})
