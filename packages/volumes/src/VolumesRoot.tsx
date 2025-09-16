import { CircleProgress } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

export const VolumesRoot = () => {
  return (
    <React.Suspense fallback={<CircleProgress />}>
      <Outlet />
    </React.Suspense>
  );
};
