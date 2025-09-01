import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      host: "0.0.0.0",
      port: 8080,
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor libraries principais
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          
          // UI components em chunk separado
          'ui-radix': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-select',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-tabs'
          ],
          
          // Supabase em chunk separado
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // Charts em chunk separado
          'vendor-charts': ['recharts'],
          
          // Motion em chunk separado
          'vendor-motion': ['framer-motion'],
          
          // Forms em chunk separado
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utils em chunk separado
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          
          // Date utilities
          'vendor-date': ['date-fns'],
          
          // Excel/XLSX separado (muito grande)
          'vendor-excel': ['xlsx'],
          
          // AI/Transformers separado (muito grande)
          'vendor-ai': ['@huggingface/transformers']
        },
      },
    },
    chunkSizeWarningLimit: 500, // Mais conservador
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Otimizações conservadoras
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'lucide-react',
    ],
  },
}));

