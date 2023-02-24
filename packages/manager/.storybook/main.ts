import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';
import svgr from 'vite-plugin-svgr';

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.@(mdx|stories.@(js|ts|jsx|tsx))',
    '../src/features/**/*.@(mdx|stories.@(js|ts|jsx|tsx))'
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
  ],
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    autodocs: true
  },
  features: {
    storyStoreV7: true,
  },
  async viteFinal(config) {
    console.log(config.plugins)
    return mergeConfig(config, {
      // root: `${__dirname}/../`,
      // cacheDir: path.resolve(__dirname, '../node_modules/.cache/vite'),
      resolve: {
        alias: {
          src: `${__dirname}/../src`,
        },
        preserveSymlinks: true,
      },
      define: {
        'process.env': {}
      },
      // plugins: [svgr({ exportAsDefault: true }), ...(config.plugins ?? [])]
    });
  },
};

export default config;