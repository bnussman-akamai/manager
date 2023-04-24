import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { Filter, Params } from '@linode/api-v4/src/types';
import { EventWithStore } from 'src/events';
import { queryKey as linodesQueryKey } from './linodes/linodes';
import { getAll } from 'src/utilities/getAll';
import { updateInPaginatedStore } from './base';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import {
  attachVolume,
  AttachVolumePayload,
  detachVolume,
  getVolumes,
  Volume,
  UpdateVolumeRequest,
  updateVolume,
  ResizeVolumePayload,
  resizeVolume,
  cloneVolume,
  CloneVolumePayload,
  deleteVolume,
  VolumeRequestPayload,
  createVolume,
  getLinodeVolumes,
} from '@linode/api-v4';

export const queryKey = 'volumes';

export const useVolumesQuery = (params: Params, filters: Filter) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    [queryKey, 'paginated', params, filters],
    () => getVolumes(params, filters),
    { keepPreviousData: true }
  );

export const useInfiniteVolumesQuery = (filter: Filter) =>
  useInfiniteQuery<ResourcePage<Volume>, APIError[]>(
    [queryKey, 'infinite', filter],
    ({ pageParam }) => getVolumes({ page: pageParam, page_size: 25 }, filter),
    {
      getNextPageParam: ({ page, pages }) => {
        if (page === pages) {
          return undefined;
        }
        return page + 1;
      },
    }
  );

export const useAllVolumesQuery = (
  params: Params = {},
  filters: Filter = {},
  enabled = true
) =>
  useQuery<Volume[], APIError[]>(
    [queryKey, 'all', params, filters],
    () => getAllVolumes(params, filters),
    {
      enabled,
    }
  );

export const useLinodeVolumesQuery = (
  linodeId: number,
  params: Params = {},
  filters: Filter = {},
  enabled = true
) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    [queryKey, 'linode', linodeId, params, filters],
    () => getLinodeVolumes(linodeId, params, filters),
    { keepPreviousData: true, enabled }
  );

export const useResizeVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Volume,
    APIError[],
    { volumeId: number } & ResizeVolumePayload
  >(({ volumeId, ...data }) => resizeVolume(volumeId, data), {
    onSuccess(volume) {
      updateInPaginatedStore<Volume>(
        [queryKey, 'paginated'],
        volume.id,
        volume,
        queryClient
      );
    },
  });
};

export const useCloneVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Volume,
    APIError[],
    { volumeId: number } & CloneVolumePayload
  >(({ volumeId, ...data }) => cloneVolume(volumeId, data), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useDeleteVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>(
    ({ id }) => deleteVolume(id),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );
};

export const useCreateVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], VolumeRequestPayload>(createVolume, {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useUpdateVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Volume,
    APIError[],
    { volumeId: number } & UpdateVolumeRequest
  >(({ volumeId, ...data }) => updateVolume(volumeId, data), {
    onSuccess(volume) {
      updateInPaginatedStore<Volume>(
        [queryKey, 'paginated'],
        volume.id,
        volume,
        queryClient
      );
      if (volume.linode_id) {
        queryClient.invalidateQueries([queryKey, 'linode', volume.linode_id]);
      }
    },
  });
};

export const useAttachVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Volume,
    APIError[],
    { volumeId: number } & AttachVolumePayload
  >(({ volumeId, ...data }) => attachVolume(volumeId, data), {
    onSuccess(volume) {
      updateInPaginatedStore<Volume>(
        [queryKey, 'paginated'],
        volume.id,
        volume,
        queryClient
      );
      if (volume.linode_id) {
        queryClient.invalidateQueries([queryKey, 'linode', volume.linode_id]);
      }
    },
  });
};

export const useDetachVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => detachVolume(id));

export const volumeEventsHandler = ({ event, queryClient }: EventWithStore) => {
  if (['finished', 'failed', 'started'].includes(event.status)) {
    queryClient.invalidateQueries([queryKey]);

    // Volume attach and detach events will expose a secondary_entity
    // with the Linode's id. This allows us to keep useLinodeVolumesQuery up to date.
    if (event.secondary_entity?.type === 'linode') {
      queryClient.invalidateQueries([
        linodesQueryKey,
        'linode',
        event.secondary_entity.id,
        'volumes',
      ]);
    }
  }
};

const getAllVolumes = (passedParams: Params = {}, passedFilter: Filter = {}) =>
  getAll<Volume>((params, filter) =>
    getVolumes({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const getVolumesForLinode = (volumes: Volume[], linodeId: number) =>
  volumes.filter(({ linode_id }) => linode_id && linode_id === linodeId);
