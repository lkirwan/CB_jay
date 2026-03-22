import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const devApiProxyTarget = env.VITE_DEV_API_PROXY_TARGET ?? 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': devApiProxyTarget,
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setupTests.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/main.jsx'],
      },
    },
  }
})
