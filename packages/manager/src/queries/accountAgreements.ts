import { Agreements, signAgreement } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { reportException } from 'src/exceptionReporting';
import { useProfile } from 'src/queries/profile';

import { accountQueries } from './account';
import { queryPresets, simpleMutationHandlers } from './base';

export const useAccountAgreements = (enabled?: boolean) => {
  const { data: profile } = useProfile();

  return useQuery<Agreements, APIError[]>({
    ...accountQueries.agreements(),
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled:
      enabled === undefined
        ? !profile?.restricted
        : enabled && !profile?.restricted,
  });
};

export const useMutateAccountAgreements = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], Partial<Agreements>>({
    mutationFn: signAgreement,
    ...simpleMutationHandlers<Agreements, Partial<Agreements>>(
      accountQueries.agreements().queryKey,
      queryClient
    ),
  });
};

export const reportAgreementSigningError = (err: any) => {
  let customErrorMessage =
    'Expected to sign the EU agreement, but the request resulted in an error';
  const apiErrorMessage = err?.[0]?.reason;

  if (apiErrorMessage) {
    customErrorMessage += `: ${apiErrorMessage}`;
  }

  reportException(customErrorMessage);
};
