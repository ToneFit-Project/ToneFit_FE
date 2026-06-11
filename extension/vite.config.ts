import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { crx } from '@crxjs/vite-plugin';
import path from 'path';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
  resolve: {
    // React 이중 인스턴스 방지 — ../src/ 파일들도 extension의 React 사용
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom'],
    alias: {
      // Extension 내부 소스
      '@ext': path.resolve(__dirname, './src'),
      // 웹 앱과 공유하는 소스 (ToneFitPanel, api, types, utils 등)
      '@': path.resolve(__dirname, '../src'),
      // 디자인 토큰 CSS 직접 참조
      '@styles': path.resolve(__dirname, '../src/styles'),
      // React 단일 인스턴스 명시 고정
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(
        __dirname,
        './node_modules/react/jsx-runtime'
      ),
    },
  },
  server: {
    cors: {
      origin: '*',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
