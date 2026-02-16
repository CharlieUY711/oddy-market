import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Incluir todos los archivos JSX/TSX
      include: /\.(jsx|tsx)$/,
    }),
  ],
  resolve: {
    alias: {
      // Path aliases para imports más limpios
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      // Aliases para ODDY_Market
      '/utils': path.resolve(__dirname, './ODDY_Market/utils'),
      '@erp': path.resolve(__dirname, './ODDY_Market/src/app/components'),
      '@secondhand': path.resolve(__dirname, './ODDY_Market/src/app/components/secondhand'),
    },
    // Permitir importar archivos TypeScript
    // Orden importante: .jsx antes de .js para evitar conflictos
    extensions: ['.mjs', '.jsx', '.js', '.mts', '.tsx', '.ts', '.json'],
    // Asegurar que Vite procese archivos fuera de src
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    exclude: ['fabric'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/tonbridge': {
        target: 'https://wallet.binance.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/tonbridge/, '/tonbridge'),
        timeout: 60000
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // Optimización de assets
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg'],
});
