import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

const { publicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig({
  html: {
    template: './index.html',
  },
  plugins: [
    pluginReact(),
    pluginSvgr({
      svgrOptions: {
        exportType: 'default',
      },
    }),
  ],
  source: {
    define: publicVars,
    entry: {
      index: './src/index.tsx',
    },
  },
  tools: {
    rspack: {
      module: {
        rules: [
          {
            resourceQuery: /raw/,
            type: 'asset/source',
          },
        ],
      },
    },
  },
});
