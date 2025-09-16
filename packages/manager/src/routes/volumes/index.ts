import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';

const volumesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'volumes',
  wrapInSuspense: true,
}).lazy(() => import('./volumesLazyRoute').then((m) => m.volumesAppLazyRoute));

export const volumesRouteTree = volumesRoute;
