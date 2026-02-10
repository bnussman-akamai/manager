import * as Sentry from '@sentry/react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSearch } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { SplashScreen } from 'src/components/SplashScreen';

import { clearStorageAndRedirectToLogout, handleOAuthCallback } from './oauth';

/**
 * Login will redirect back to Cloud Manager with a URL like:
 * https://cloud.linode.com/oauth/callback?returnTo=%2F&state=066a6ad9-b19a-43bb-b99a-ef0b5d4fc58d&code=42ddf75dfa2cacbad897
 *
 * We will handle taking the code, turning it into an access token, and start a Cloud Manager session.
 */
export const OAuthCallback = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: '/oauth/callback' });

  const { mutate } = useMutation({
    mutationFn: () => handleOAuthCallback({ params: search }),
    onSuccess(data) {
      navigate({ to: data.returnTo ?? '/' });
    },
    onError(error) {
      // eslint-disable-next-line no-console
      console.error(error);
      Sentry.captureException(error);
      clearStorageAndRedirectToLogout();
    },
  });

  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <SplashScreen />;
};
