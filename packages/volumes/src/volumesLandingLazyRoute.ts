import { createLazyRoute } from '@tanstack/react-router';

import { VolumesLanding } from './VolumesLanding';

export const volumesLandingLazyRoute = createLazyRoute('/')({
  component: VolumesLanding,
});
