import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { Snackbar } from 'src/components/Snackbar/Snackbar';
import { SplashScreen } from 'src/components/SplashScreen';
import 'src/exceptionReporting';
import { setupInterceptors } from 'src/request';
import { storeFactory } from 'src/store';

import { App } from './App';
import { loadDevTools, shouldEnableDevTools } from './dev-tools/load';
import './index.css';
import { LinodeThemeWrapper } from './LinodeThemeWrapper';
import { Logout } from './Logout';
import { OAuth, useOAuth } from './OAuth';
import { queryClientFactory } from './queries/base';

const queryClient = queryClientFactory('longLived');
const store = storeFactory();

setupInterceptors(store);

const Lish = React.lazy(() => import('src/features/Lish'));
const CancelLanding = React.lazy(
  () => import('src/features/CancelLanding/CancelLanding')
);

const Main = () => {
  const { isLoading } = useOAuth();

  if (isLoading) {
    return (
      <Router>
        <Switch>
          <Route component={OAuth} path="/oauth/callback" />
        </Switch>
      </Router>
    );
  }

  return (
    <ReduxStoreProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <LinodeThemeWrapper>
          <CssBaseline />
          <React.Suspense fallback={<SplashScreen />}>
            <Router>
              <Switch>
                <Route component={Logout} exact path="/logout" />
                <Route component={CancelLanding} exact path="/cancel" />
                <Snackbar
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  autoHideDuration={4000}
                  hideIconVariant={true}
                  maxSnack={3}
                >
                  <Switch>
                    <Route
                      component={Lish}
                      path="/linodes/:linodeId/lish/:type"
                    />
                    <Route component={App} />
                  </Switch>
                </Snackbar>
              </Switch>
            </Router>
          </React.Suspense>
        </LinodeThemeWrapper>
        <ReactQueryDevtools
          initialIsOpen={false}
          toggleButtonProps={{ style: { marginLeft: '3em' } }}
        />
      </QueryClientProvider>
    </ReduxStoreProvider>
  );
};

async function loadApp() {
  if (shouldEnableDevTools) {
    // If devtools are enabled, load them before we load the main app.
    // This ensures the MSW is setup before we start making API calls.
    await loadDevTools(store);
  }
  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(<Main />);
}

loadApp();
