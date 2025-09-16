import { createLazyRoute } from '@tanstack/react-router';
import { lazy } from 'react';

// @ts-expect-error no types for module federated modules
const Remote = lazy(async () => import('volumes/app'));

export const volumesAppLazyRoute = createLazyRoute('/volumes')({
  component: Remote,
});
