import { queryClientFactory } from '@linode/queries';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxStoreProvider } from 'react-redux';

import { CookieWarning } from 'src/components/CookieWarning';
import 'src/exceptionReporting';
import { SplashScreen } from 'src/components/SplashScreen';
import { setupInterceptors } from 'src/request';
import { storeFactory } from 'src/store';

import './index.css';
import { App } from './App';
import { ENABLE_DEV_TOOLS } from './constants';
import { LinodeThemeWrapper } from './LinodeThemeWrapper';

const queryClient = queryClientFactory('longLived');
const store = storeFactory();

setupInterceptors(store);

const Main = () => {
  if (!navigator.cookieEnabled) {
    return <CookieWarning />;
  }

  return (
    <ReduxStoreProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <LinodeThemeWrapper>
          <CssBaseline enableColorScheme />
          <React.Suspense fallback={<SplashScreen />}>
            <App />
          </React.Suspense>
        </LinodeThemeWrapper>
      </QueryClientProvider>
    </ReduxStoreProvider>
  );
};

async function loadApp() {
  if (ENABLE_DEV_TOOLS && !window.location.pathname.includes('/lish/')) {
    const devTools = await import('./dev-tools/load');
    await devTools.loadDevTools();

    const { DevTools } = await import('./dev-tools/DevTools');

    const devToolsRootContainer = document.createElement('div');
    devToolsRootContainer.id = 'dev-tools-root';
    document.body.appendChild(devToolsRootContainer);

    const root = createRoot(devToolsRootContainer);

    root.render(<DevTools queryClient={queryClient} store={store} />);

    // New dev tools
    const { installDevTools } = await import('compute-ui-dev-tools');
    const { handlers, paysByAkamaiCustomerHandlers } = await import('src/mocks/serverHandlers');

    await installDevTools({
      handlerSets: [
        { name: 'default', enabledByDefault: true, handlers },
        {
          name: 'pays-via-akamai',
          enabledByDefault: false,
          handlers: paysByAkamaiCustomerHandlers,
        },
      ],
      onHandlersChanged() {
        queryClient.invalidateQueries();
      },
    });
  }

  const container = document.getElementById('root');
  createRoot(container!).render(<Main />);
}

loadApp();
