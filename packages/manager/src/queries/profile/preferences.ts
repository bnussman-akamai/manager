import { updateUserPreferences } from '@linode/api-v4';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { ManagerPreferences } from 'src/types/ManagerPreferences';

import { queryPresets } from '../base';
import { profileQueries } from './profile';

import type { APIError } from '@linode/api-v4';

export const usePreferences = <TData = ManagerPreferences>(
  select?: (data: ManagerPreferences | undefined) => TData,
  enabled = true,
) =>
  useQuery({
    ...profileQueries.preferences,
    ...queryPresets.oneTimeFetch,
    select,
    enabled,
  });

export const useMutatePreferences = (replace = false) => {
  const queryClient = useQueryClient();

  return useMutation<
    ManagerPreferences,
    APIError[],
    Partial<ManagerPreferences>
  >({
    async mutationFn(data) {
      if (replace) {
        return updateUserPreferences(data);
      } else {
        const existingPreferences = await queryClient.ensureQueryData(profileQueries.preferences);
        return updateUserPreferences({...existingPreferences, ...data});
      }
    },
    onMutate: (data) => updatePreferenceData(data, replace, queryClient),
  });
};

export const updatePreferenceData = (
  newData: Partial<ManagerPreferences>,
  replace: boolean,
  queryClient: QueryClient
): void => {
  queryClient.setQueryData<ManagerPreferences>(
    profileQueries.preferences.queryKey,
    (oldData) => ({
      ...(!replace ? oldData : {}),
      ...newData,
    })
  );
};
