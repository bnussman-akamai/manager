import {
  APIError,
  Filter,
  OAuthClient,
  OAuthClientRequest,
  Params,
  createOAuthClient,
  deleteOAuthClient,
  resetOAuthClientSecret,
  updateOAuthClient,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EventWithStore } from 'src/events';

import { accountQueries } from './account';

export const useOAuthClientsQuery = (params?: Params, filter?: Filter) =>
  useQuery({
    ...accountQueries.oauthClients.paginated(params, filter),
    keepPreviousData: true,
  });

export const useResetOAuthClientMutation = (id: string) =>
  useMutation<OAuthClient & { secret: string }, APIError[]>(() =>
    resetOAuthClientSecret(id)
  );

export const useDeleteOAuthClientMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteOAuthClient(id), {
    onSuccess() {
      queryClient.invalidateQueries(accountQueries.oauthClients.queryKey);
    },
  });
};

export const useCreateOAuthClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    OAuthClient & { secret: string },
    APIError[],
    OAuthClientRequest
  >(createOAuthClient, {
    onSuccess() {
      queryClient.invalidateQueries(accountQueries.oauthClients.queryKey);
    },
  });
};

export const useUpdateOAuthClientMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<OAuthClient, APIError[], Partial<OAuthClientRequest>>(
    (data) => updateOAuthClient(id, data),
    {
      onSuccess() {
        queryClient.invalidateQueries(accountQueries.oauthClients.queryKey);
      },
    }
  );
};

export const oauthClientsEventHandler = ({ queryClient }: EventWithStore) => {
  // We may over-fetch because on `onSuccess` also invalidates, but this will be
  // good for UX because Cloud will always be up to date
  queryClient.invalidateQueries(accountQueries.oauthClients.queryKey);
};
