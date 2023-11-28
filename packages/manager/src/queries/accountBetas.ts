import {
  AccountBeta,
  EnrollInBetaPayload,
  enrollInBeta,
} from '@linode/api-v4/lib/account';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { accountQueries } from './account';

export const queryKey = 'account-betas';

export const useAccountBetasQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<AccountBeta>, APIError[]>({
    ...accountQueries.betas.paginated(params, filter),
    keepPreviousData: true,
  });

export const useAccountBetaQuery = (id: string) =>
  useQuery<AccountBeta, APIError[]>(accountQueries.betas.beta(id));

export const useCreateAccountBetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], EnrollInBetaPayload>(
    (data) => {
      return enrollInBeta(data);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(accountQueries.betas.queryKey);
        queryClient.invalidateQueries(['regions', 'paginated']);
      },
    }
  );
};
