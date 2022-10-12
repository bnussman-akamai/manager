import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { queryClient, updateInPaginatedStore } from './base';
import {
  attachVolume,
  AttachVolumePayload,
  detachVolume,
  getVolumes,
  Volume,
  Event,
  UpdateVolumeRequest,
  updateVolume,
  ResizeVolumePayload,
  resizeVolume,
  cloneVolume,
  CloneVolumePayload,
  deleteVolume,
  VolumeRequestPayload,
  createVolume,
} from '@linode/api-v4';

const queryKey = 'volumes';

export const useVolumesQuery = (params: any, filters: any) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    [`${queryKey}-list`, params, filters],
    () => getVolumes(params, filters),
    { keepPreviousData: true }
  );

export const useResizeVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & ResizeVolumePayload>(
    ({ volumeId, ...data }) => resizeVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(`${queryKey}-list`, volume.id, volume);
      },
    }
  );

export const useCloneVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & CloneVolumePayload>(
    ({ volumeId, ...data }) => cloneVolume(volumeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries(`${queryKey}-list`);
      },
    }
  );

export const useDeleteVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => deleteVolume(id), {
    onSuccess() {
      queryClient.invalidateQueries(`${queryKey}-list`);
    },
  });

export const useCreateVolumeMutation = () =>
  useMutation<Volume, APIError[], VolumeRequestPayload>(createVolume, {
    onSuccess() {
      queryClient.invalidateQueries(`${queryKey}-list`);
    },
  });

export const useUpdateVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & UpdateVolumeRequest>(
    ({ volumeId, ...data }) => updateVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(`${queryKey}-list`, volume.id, volume);
      },
    }
  );

export const useAttachVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & AttachVolumePayload>(
    ({ volumeId, ...data }) => attachVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(`${queryKey}-list`, volume.id, volume);
      },
    }
  );

export const useDetachVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => detachVolume(id));

export const volumeEventsHandler = (event: Event) => {
  const { action, status, entity } = event;

  switch (action) {
    case 'volume_create':
      switch (status) {
        case 'scheduled':
          return;
        case 'failed':
        case 'finished':
        case 'notification':
        case 'started':
          queryClient.invalidateQueries(`${queryKey}-list`);
          return;
      }
    case 'volume_attach':
      return;
    case 'volume_update':
      return;
    case 'volume_detach':
      // This means a detach was successful. Remove associated Linode.
      updateInPaginatedStore<Volume>(`${queryKey}-list`, entity!.id, {
        linode_id: null,
        linode_label: null,
      });
      return;
    case 'volume_resize':
      // This means a resize was successful. Transition from 'resizing' to 'active'.
      updateInPaginatedStore<Volume>(`${queryKey}-list`, entity!.id, {
        status: 'active',
      });
      return;
    case 'volume_clone':
      // This is very hacky, but we have no way to know when a cloned volume should transition
      // from 'creating' to 'active' so we will wait a bit after a volume is cloned, then refresh
      // and hopefully the volume is active.
      setTimeout(() => {
        queryClient.invalidateQueries(`${queryKey}-list`);
      }, 5000);
      return;
    case 'volume_delete':
      return;
    case 'volume_migrate':
      return;
    default:
      return;
  }
};
