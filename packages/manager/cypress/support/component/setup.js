"use strict";
// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountWithTheme = void 0;
var base_1 = require("@src/queries/base");
var react_query_1 = require("@tanstack/react-query");
var react_router_1 = require("@tanstack/react-router");
require("@testing-library/cypress/add-commands");
require("cypress-axe");
var react_1 = require("cypress/react");
var launchdarkly_react_client_sdk_1 = require("launchdarkly-react-client-sdk");
var notistack_1 = require("notistack");
var React = require("react");
var react_redux_1 = require("react-redux");
var react_router_dom_1 = require("react-router-dom");
var LinodeThemeWrapper_1 = require("src/LinodeThemeWrapper");
var store_1 = require("src/store");
/**
 * Mounts a component with a Cloud Manager theme applied.
 *
 * @param jsx - React Component to mount.
 * @param theme - Cloud Manager theme to apply. Defaults to `light`.
 */
var mountWithTheme = function (jsx, theme, flags, useTanstackRouter) {
    if (theme === void 0) { theme = 'light'; }
    if (flags === void 0) { flags = {}; }
    if (useTanstackRouter === void 0) { useTanstackRouter = false; }
    var queryClient = (0, base_1.queryClientFactory)();
    var store = (0, store_1.storeFactory)();
    var rootRoute = (0, react_router_1.createRootRoute)({});
    var indexRoute = (0, react_router_1.createRoute)({
        component: function () { return jsx; },
        getParentRoute: function () { return rootRoute; },
        path: '/',
    });
    var router = (0, react_router_1.createRouter)({
        history: (0, react_router_1.createMemoryHistory)({
            initialEntries: ['/'],
        }),
        routeTree: rootRoute.addChildren([indexRoute]),
    });
    return (0, react_1.mount)(<react_redux_1.Provider store={store}>
      <react_query_1.QueryClientProvider client={queryClient}>
        <LinodeThemeWrapper_1.LinodeThemeWrapper theme={theme}>
          <launchdarkly_react_client_sdk_1.LDProvider clientSideID={''} deferInitialization flags={flags} options={{ bootstrap: flags }}>
            <notistack_1.SnackbarProvider>
              {useTanstackRouter ? (<react_router_dom_1.MemoryRouter>
                  <react_router_1.RouterProvider router={router}/>
                </react_router_dom_1.MemoryRouter>) : (<react_router_dom_1.MemoryRouter>{jsx}</react_router_dom_1.MemoryRouter>)}
            </notistack_1.SnackbarProvider>
          </launchdarkly_react_client_sdk_1.LDProvider>
        </LinodeThemeWrapper_1.LinodeThemeWrapper>
      </react_query_1.QueryClientProvider>
    </react_redux_1.Provider>);
};
exports.mountWithTheme = mountWithTheme;
Cypress.Commands.add('mount', react_1.mount);
Cypress.Commands.add('mountWithTheme', exports.mountWithTheme);
