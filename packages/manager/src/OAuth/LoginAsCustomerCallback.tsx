import * as Sentry from '@sentry/react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { SplashScreen } from 'src/components/SplashScreen';
import {
  clearStorageAndRedirectToLogout,
  handleLoginAsCustomerCallback,
} from 'src/OAuth/oauth';

/**
 * This component is similar to the OAuth component, in that it's main
 * purpose is to consume the data given from the hash params provided from
 * where the user was navigated from. In the case of this component, the user
 * was navigated from Admin and the query params differ from what they would be
 * if the user navigated from Login. Further, we are doing no nonce checking here.
 *
 * Admin will redirect to Cloud Manager with a URL like:
 * https://cloud.linode.com/admin/callback#access_token=fjhwehkfg&destination=dashboard&expires_in=900&token_type=Admin
 */
export const LoginAsCustomerCallback = () => {
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: () =>
      handleLoginAsCustomerCallback({
        params: location.hash.substring(1), // substring is called to remove the leading "#" from the hash params
      }),
    onSuccess(data) {
      navigate({ to: data.returnTo });
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
