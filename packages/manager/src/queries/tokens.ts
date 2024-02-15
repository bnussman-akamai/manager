import {
  createPersonalAccessToken,
  deleteAppToken,
  deletePersonalAccessToken,
  updatePersonalAccessToken,
} from '@linode/api-v4/lib/profile';
import { Token, TokenRequest } from '@linode/api-v4/lib/profile/types';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { EventHandlerData } from 'src/hooks/useEventHandlers';

import { updateInPaginatedStore } from './base';
import { profileQueries } from './profile';

export const useAppTokensQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    keepPreviousData: true,
    ...profileQueries.profile().appTokens(params, filter),
  });
};

export const usePersonalAccessTokensQuery = (
  params?: Params,
  filter?: Filter
) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    keepPreviousData: true,
    ...profileQueries.profile().personalAccessTokens(params, filter),
  });
};

export const useCreatePersonalAccessTokenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Token, APIError[], TokenRequest>({
    mutationFn: createPersonalAccessToken,
    onSuccess() {
      queryClient.invalidateQueries(
        profileQueries.profile().personalAccessTokens.queryKey
      );
    },
  });
};

export const useUpdatePersonalAccessTokenMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Token, APIError[], Partial<TokenRequest>>({
    mutationFn: (data) => updatePersonalAccessToken(id, data),
    onSuccess(token) {
      updateInPaginatedStore(
        profileQueries.profile().personalAccessTokens.queryKey,
        id,
        token,
        queryClient
      );
    },
  });
};

export const useRevokePersonalAccessTokenMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deletePersonalAccessToken(id),
    onSuccess() {
      // Wait 1 second to invalidate cache after deletion because API needs time
      setTimeout(
        () =>
          queryClient.invalidateQueries(
            profileQueries.profile().personalAccessTokens.queryKey
          ),
        1000
      );
    },
  });
};

export const useRevokeAppAccessTokenMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteAppToken(id),
    onSuccess() {
      // Wait 1 second to invalidate cache after deletion because API needs time
      setTimeout(
        () =>
          queryClient.invalidateQueries(
            profileQueries.profile().appTokens.queryKey
          ),
        1000
      );
    },
  });
};

export function tokenEventHandler({ queryClient }: EventHandlerData) {
  queryClient.invalidateQueries(
    profileQueries.profile().personalAccessTokens.queryKey
  );
}
