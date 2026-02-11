import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // V4 PLUGIN

export default defineConfig({
  plugins: [tailwindcss(), react()],  // V4: tailwindcss() FIRST
})
