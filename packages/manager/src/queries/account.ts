import {
  Account,
  getAccountAgreements,
  getAccountAvailabilities,
  getAccountInfo,
  getAccountLogins,
  updateAccountInfo,
} from '@linode/api-v4/lib/account';
import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useProfile } from 'src/queries/profile';
import { getQueryKeys } from 'src/utilities/queryKeyFactory';

import { getAllAccountAvailabilitiesRequest } from './accountAvailability';
import { queryPresets } from './base';

const accountQueries = getQueryKeys({
  account: {
    agreements: {
      queryFn: getAccountAgreements,
    },
    avilability: {
      all: {
        queryFn: getAllAccountAvailabilitiesRequest,
      },
      paginated: (params: Params, filters: Filter) => ({
        queryFn: () => getAccountAvailabilities(params, filters),
        queryKey: [params, filters],
      }),
    },
    info: {
      queryFn: getAccountInfo,
    },
  },
});

const key1 = accountQueries.account.avilability.paginated({ page: 1 }, { id: 1}).queryKey;
const key3 = accountQueries.account.avilability.paginated({}, {}).queryFn;
const key2 = accountQueries.account.avilability.paginated.queryKey;

expect(accountQueries).toBe({
  queryKey: ['account'],
  agreements: {
    queryKey: ['account', 'agreements'],
    queryFn: getAccountAgreements,
  },
  info: {
    queryKey: ['account', 'info'],
    queryFn: getAccountInfo,
  },
  avilability: {
    queryKey: ['account', 'avilability'],
    all: {
      queryKey: ['account', 'avilability', 'all'],
      queryFn: getAllAccountAvailability,
    },
    paginated: (params: Params, filters: Filters) => ({
      queryKey: ['account', 'avilability', 'paginated', params, filters],
      queryFn: () => getAllAccountAvailability(params, filters),
    }),
  },
});

export const useAccount = () => {
  const { data: profile } = useProfile();

  return useQuery<Account, APIError[]>({
    ...accountQueries.info(),
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

export const useMutateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<Account, APIError[], Partial<Account>>({
    mutationFn: updateAccountInfo,
    onSuccess(account) {
      queryClient.setQueryData(accountQueries.info().queryKey, account);
    },
  });
};
