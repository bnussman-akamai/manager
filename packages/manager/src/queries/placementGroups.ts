import {
  assignLinodesToPlacementGroup,
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroup,
  getPlacementGroups,
  unassignLinodesFromPlacementGroup,
  updatePlacementGroup,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import { linodeQueries } from './linodes/linodes';
import { profileQueries } from './profile/profile';

import type {
  AssignLinodesToPlacementGroupPayload,
  CreatePlacementGroupPayload,
  PlacementGroup,
  UnassignLinodesFromPlacementGroupPayload,
  UpdatePlacementGroupPayload,
} from '@linode/api-v4';
import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';

const getAllPlacementGroupsRequest = (
  _params: Params = {},
  _filter: Filter = {}
) =>
  getAll<PlacementGroup>((params, filter) =>
    getPlacementGroups({ ...params, ..._params }, { ...filter, ..._filter })
  )().then((data) => data.data);

export const placementGroupQueries = createQueryKeys('placement-groups', {
  all: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAllPlacementGroupsRequest(params, filter),
    queryKey: [params, filter],
  }),
  paginated: (params: Params, filter: Filter) => ({
    queryFn: () => getPlacementGroups(params, filter),
    queryKey: [params, filter],
  }),
  placementGroup: (placementGroupId: number) => ({
    queryFn: () => getPlacementGroup(placementGroupId),
    queryKey: [placementGroupId],
  }),
});

interface AllPlacementGroupsQueryOptions {
  enabled?: boolean;
  filter?: Filter;
  params?: Params;
}

export const useAllPlacementGroupsQuery = ({
  enabled = true,
  filter = {},
  params = {},
}: AllPlacementGroupsQueryOptions) =>
  useQuery<PlacementGroup[], APIError[]>({
    enabled,
    ...placementGroupQueries.all(params, filter),
  });

export const usePlacementGroupsQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = true
) =>
  useQuery<ResourcePage<PlacementGroup>, APIError[]>({
    enabled,
    keepPreviousData: true,
    ...placementGroupQueries.paginated(params, filter),
  });

export const usePlacementGroupQuery = (
  placementGroupId: number,
  enabled: boolean = true
) => {
  return useQuery<PlacementGroup, APIError[]>({
    enabled,
    ...placementGroupQueries.placementGroup(placementGroupId),
  });
};

export const useCreatePlacementGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<PlacementGroup, APIError[], CreatePlacementGroupPayload>({
    mutationFn: createPlacementGroup,
    onSuccess: (placementGroup) => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all._def);
      queryClient.setQueryData<PlacementGroup>(
        placementGroupQueries.placementGroup(placementGroup.id).queryKey,
        placementGroup
      );

      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries(profileQueries.grants.queryKey);
    },
  });
};

export const useMutatePlacementGroup = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<PlacementGroup, APIError[], UpdatePlacementGroupPayload>({
    mutationFn: (data) => updatePlacementGroup(id, data),
    onSuccess: (placementGroup) => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all._def);
      queryClient.setQueryData(
        placementGroupQueries.placementGroup(id).queryKey,
        placementGroup
      );
    },
  });
};

export const useDeletePlacementGroup = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => deletePlacementGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all._def);
      queryClient.removeQueries(
        placementGroupQueries.placementGroup(id).queryKey
      );
    },
  });
};

export const useAssignLinodesToPlacementGroup = (placementGroupId: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    PlacementGroup,
    APIError[],
    AssignLinodesToPlacementGroupPayload
  >({
    mutationFn: (req) => assignLinodesToPlacementGroup(placementGroupId, req),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all._def);
      queryClient.invalidateQueries(
        placementGroupQueries.placementGroup(placementGroupId).queryKey
      );

      for (const linodeId of variables.linodes) {
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId).queryKey,
        });
      }
    },
  });
};

export const useUnassignLinodesFromPlacementGroup = (
  placementGroupId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<
    PlacementGroup,
    APIError[],
    UnassignLinodesFromPlacementGroupPayload
  >({
    mutationFn: (req) =>
      unassignLinodesFromPlacementGroup(placementGroupId, req),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all._def);
      queryClient.invalidateQueries(
        placementGroupQueries.placementGroup(placementGroupId).queryKey
      );

      for (const linodeId of variables.linodes) {
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId).queryKey,
        });
      }
    },
  });
};
