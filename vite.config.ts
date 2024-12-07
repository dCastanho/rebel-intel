import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  base: "/rebel-intel/",
  plugins: [svelte()],
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
      // Use a specific port (optional)
},
})
