import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://www.teenymoney.kro.kr',
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: '',
        configure(proxy) {
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie']
            if (!setCookie) return

            proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
              cookie
                .replace(/;\s*Domain=[^;]*/gi, '')
                .replace(/;\s*Secure/gi, '')
                .replace(/;\s*Partitioned/gi, '')
                .replace(/;\s*SameSite=None/gi, '; SameSite=Lax'),
            )
          })
        },
      },
    },
  },
});
