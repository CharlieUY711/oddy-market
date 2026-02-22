import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Configuración para producción
  build: {
    cssCodeSplit: false, // Emitir un solo archivo CSS para evitar problemas de carga
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Un solo bundle para mejor compatibilidad
      },
    },
  },

  // Asegurar que las rutas base funcionen correctamente
  base: '/',
})
