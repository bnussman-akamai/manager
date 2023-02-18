import React from 'react';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { dark, light } from '../src/themes';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StyledEngineProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { Provider as LDProvider } from 'launchdarkly-react-client-sdk/lib/context';
import { ThemeProvider } from '../src/components/core/styles';
import { SnackbarProvider } from 'notistack';
import { MemoryRouter } from 'react-router-dom';
import store from '../src/store';
import '../src/index.css';
import '../public/fonts/fonts.css';

export const decorators = [
  (Story) => {
    return (
      // <Provider store={store}>
        <QueryClientProvider client={new QueryClient()}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={light}>
              <LDProvider
                value={{
                  flags: {},
                  flagKeyMap: {},
                }}
              >
                <SnackbarProvider>
                  <MemoryRouter>
                    <Story />
                  </MemoryRouter>
                </SnackbarProvider>
              </LDProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </QueryClientProvider>
      // </Provider>
   );
  },
];

MINIMAL_VIEWPORTS.mobile1.styles = {
  height: '667px',
  width: '375px',
};

export const parameters = {
  controls: { expanded: true },
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Intro', 'Features', 'Components', 'Elements', 'Core Styles'],
    },
  },
  previewTabs: {
    'storybook/docs/panel': { index: -1 },
  },
  viewMode: 'docs',
  viewport: {
    viewports: MINIMAL_VIEWPORTS,
  },
};
