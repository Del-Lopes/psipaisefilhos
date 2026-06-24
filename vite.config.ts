import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          // Ícone/favicon ficam em public/ — incluí-los no precache.
          includeAssets: ['favicon.png', 'logo.png'],
          manifest: {
            name: 'Gestão de Consultório — Bárbara Carvalho',
            short_name: 'Consultório',
            description: 'Central de organização do consultório de psicologia infantil.',
            lang: 'pt-BR',
            start_url: '/app',
            scope: '/app',
            display: 'standalone',
            orientation: 'portrait',
            background_color: '#FFFBF5',
            theme_color: '#4B5945',
            icons: [
              { src: '/favicon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
              { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
              { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          workbox: {
            // Casco do app (HTML/JS/CSS/imagens locais). NÃO cacheia o Supabase.
            globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2}'],
            navigateFallback: '/index.html',
            // Não sequestrar navegações fora do app de gestão.
            navigateFallbackDenylist: [/^\/$/, /^\/investimento/],
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
