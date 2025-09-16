import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';

import { VolumesRoot } from './VolumesRoot';
import type { Params } from '@linode/api-v4';

const volumeAction = {
  attach: 'attach',
  clone: 'clone',
  delete: 'delete',
  detach: 'detach',
  details: 'details',
  edit: 'edit',
  'manage-tags': 'manage-tags',
  resize: 'resize',
  upgrade: 'upgrade',
} as const;

export type VolumeAction = (typeof volumeAction)[keyof typeof volumeAction];

export interface VolumesSearchParams extends Params {
  query?: string;
}

const rootRoute = createRootRoute({
  component: VolumesRoot,
})

const volumeDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  parseParams: (params) => ({
    volumeId: Number(params.volumeId),
  }),
  // validateSearch: (search: VolumesSearchParams) => search,
  path: '$volumeId',
}).lazy(() =>
  import('./VolumeDetails/volumeDetailsLazyRoute').then(
    (m) => m.volumeDetailsLazyRoute
  )
);

const volumeDetailsSummaryRoute = createRoute({
  path: 'summary',
  getParentRoute: () => volumeDetailsRoute,
});

const volumeDetailsSummaryActionRoute = createRoute({
  path: '$action',
  getParentRoute: () => volumeDetailsRoute,
  params: {
    parse: ({ action }) => ({
      action: action as VolumeAction,
    }),
  },
  validateSearch: (search: VolumesSearchParams) => search,
});

const volumesIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: VolumesSearchParams) => search,
}).lazy(() =>
  import('./volumesLandingLazyRoute').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'create',
}).lazy(() =>
  import('./volumesCreateLazyRoute').then(
    (m) => m.volumeCreateLazyRoute
  )
);

const volumeActionRoute = createRoute({
  getParentRoute: () => rootRoute,
  params: {
    parse: ({ action, volumeId }) => ({
      action: action as VolumeAction,
      volumeId: Number(volumeId),
    }),
  },
  path: '$volumeId/$action',
  validateSearch: (search: VolumesSearchParams) => search,
}).lazy(() =>
  import('./volumesLandingLazyRoute').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCatchAllRoute = createRoute({
  beforeLoad: () => {
    throw redirect({
      search: () => ({}),
      to: '/',
    });
  },
  getParentRoute: () => rootRoute,
  path: '*',
});

const routeTree = rootRoute.addChildren([
  volumesCreateRoute,
  volumesIndexRoute,
  volumeDetailsSummaryRoute.addChildren([
    volumeDetailsSummaryActionRoute
  ]),
  volumeActionRoute,
  volumeDetailsRoute,
  volumesCatchAllRoute
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
