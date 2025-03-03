import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { CookieWarning } from 'src/components/CookieWarning';
import { Snackbar } from 'src/components/Snackbar/Snackbar';
import { SplashScreen } from 'src/components/SplashScreen';
import 'src/exceptionReporting';
import { Logout } from 'src/layouts/Logout';
import { setupInterceptors } from 'src/request';
import { storeFactory } from 'src/store';

const App = React.lazy(() =>
  import('./App').then((module) => ({
    default: module.App,
  }))
);

import { useOAuth } from 'src/layouts/OAuthCallback';

import NullComponent from './components/NullComponent';
import { loadDevTools, shouldLoadDevTools } from './dev-tools/load';
import './index.css';
import { LinodeThemeWrapper } from './LinodeThemeWrapper';
import { queryClientFactory } from './queries/base';
import { getRoot } from './utilities/rootManager';

const queryClient = queryClientFactory('longLived');
const store = storeFactory();

setupInterceptors(store);

const Lish = React.lazy(() => import('src/features/Lish'));

const CancelLanding = React.lazy(() =>
  import('src/features/CancelLanding/CancelLanding').then((module) => ({
    default: module.CancelLanding,
  }))
);

const LoginAsCustomerCallback = React.lazy(() =>
  import('src/layouts/LoginAsCustomerCallback').then((module) => ({
    default: module.LoginAsCustomerCallback,
  }))
);
const OAuthCallback = React.lazy(() =>
  import('src/layouts/OAuthCallback').then((module) => ({
    default: module.OAuthCallback,
  }))
);

const Main2 = () => {
  const { isLoading } = useOAuth();

  if (isLoading) {
    return (
      <React.Suspense fallback={<SplashScreen />}>
        <Switch>
          <Route component={OAuthCallback} exact path="/oauth/callback" />
          <Route
            component={LoginAsCustomerCallback}
            exact
            path="/admin/callback"
          />
          <Route component={NullComponent} exact path="/nullauth" />
          <Route component={Logout} exact path="/logout" />
          <Route component={CancelLanding} exact path="/cancel" />
        </Switch>
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={<SplashScreen />}>
      <Switch>
        <Route component={Logout} exact path="/logout" />
        <Route component={CancelLanding} exact path="/cancel" />
        <Route component={Lish} path="/linodes/:linodeId/lish/:type" />
        <Route component={App} />
      </Switch>
    </React.Suspense>
  );
};

const Main = () => {
  if (!navigator.cookieEnabled) {
    return <CookieWarning />;
  }

  return (
    <ReduxStoreProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <LinodeThemeWrapper>
          <Snackbar
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            autoHideDuration={4000}
            hideIconVariant={true}
            maxSnack={3}
          >
            <CssBaseline enableColorScheme />
            <Router>
              <Main2 />
            </Router>
          </Snackbar>
        </LinodeThemeWrapper>
      </QueryClientProvider>
    </ReduxStoreProvider>
  );
};

async function loadApp() {
  if (shouldLoadDevTools) {
    await loadDevTools(store, queryClient);
  }

  const container = document.getElementById('root');
  if (container) {
    const root = getRoot(container);
    root.render(<Main />);
  }
}

loadApp();
