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
        manualChunks: (id) => {
          // Vendor chunks - bibliotecas principais
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          
          // Admin chunk separado - maior gargalo identificado
          if (id.includes('AdminPanel') || id.includes('Admin') || id.includes('/Admin/')) {
            return 'admin';
          }
          
          // UI components chunk
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-components';
          }
          
          // Router chunk
          if (id.includes('react-router')) {
            return 'router';
          }
          
          // Supabase chunk
          if (id.includes('@supabase') || id.includes('supabase')) {
            return 'supabase';
          }
          
          // Charts chunk
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Motion/Animation chunk
          if (id.includes('framer-motion')) {
            return 'motion';
          }
          
          // Forms chunk
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'forms';
          }
          
          // Transformers/AI chunk (muito grande)
          if (id.includes('@huggingface/transformers') || id.includes('onnxruntime')) {
            return 'ai-transformers';
          }
          
          // Excel/XLSX chunk
          if (id.includes('xlsx')) {
            return 'excel';
          }
          
          // Date utilities
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          
          // Platform pages chunk
          if (id.includes('PlayStation') || id.includes('Xbox') || id.includes('Platform')) {
            return 'platform-pages';
          }
          
          // Product pages chunk
          if (id.includes('Product') && !id.includes('AdminPanel')) {
            return 'product-pages';
          }
          
          // Utils chunk
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'utils';
          }
          
          // Node modules genéricos
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
    chunkSizeWarningLimit: 300, // Reduzido para forçar chunks menores
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Otimizações adicionais
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets pequenos
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none', // Remove comentários legais para reduzir tamanho
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
    exclude: [
      '@huggingface/transformers', // Lazy load quando necessário
    ],
  },
}));

