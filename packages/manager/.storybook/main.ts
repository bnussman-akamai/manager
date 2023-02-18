import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { mergeConfig } from 'vite';
import packageJson from '../package.json';

const componentsPath = '../src/components/**/*.mdx';
const featuresPath = '../src/features/**/*.mdx';

const config: StorybookConfig = {
  stories: [componentsPath, featuresPath],
  addons: ['@storybook/addon-docs', '@storybook/addon-controls', '@storybook/addon-viewport'],
  staticDirs: ['../public'],
  core: {
    builder: '@storybook/builder-vite'
  },
  async viteFinal(config) {
    console.log(config)
    // delete config.optimizeDeps;
    // Merge custom configuration into the default config
    return mergeConfig(config, {
      root: `${__dirname}/../`,
      cacheDir: path.resolve(__dirname, '../node_modules/.cache/vite'),
      // Use the same "resolve" configuration as your app
      resolve: {
        alias: {
          src: `${__dirname}/../src`,
        },
        preserveSymlinks: true,
      },
      define: {
        'process.env': {}
      },
      // optimizeDeps: {
      //   include: Object.keys(packageJson.dependencies),
      // },
    });
  },
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    autodocs: true
  }
};

export default config;