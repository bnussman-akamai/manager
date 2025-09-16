import { defineConfig } from 'vite'
import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    federation({
      filename: 'remoteEntry.js',
      name: 'remote',
      exposes: {
        './app': './src/App.tsx',
      },
      shared: {
        react: { singleton: true, },
        'react-dom': { singleton: true, },
      },
      remotes: {},
    }),
    react()
  ],
})
