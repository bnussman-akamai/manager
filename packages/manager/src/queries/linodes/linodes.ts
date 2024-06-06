import {
  changeLinodePassword,
  cloneLinode,
  createLinode,
  deleteLinode,
  getLinode,
  getLinodeFirewalls,
  getLinodeKernel,
  getLinodeLishToken,
  getLinodes,
  linodeBoot,
  linodeReboot,
  linodeShutdown,
  rescueLinode,
  resizeLinode,
  scheduleOrQueueMigration,
  updateLinode,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { placementGroupQueries } from 'src/queries/placementGroups';
import { manuallySetVPCConfigInterfacesToActive } from 'src/utilities/configs';

import { accountQueries } from '../account/queries';
import { queryPresets } from '../base';
import { profileQueries } from '../profile/profile';
import { vlanQueries } from '../vlans';
import {
  getAllLinodeConfigs,
  getAllLinodeDisks,
  getAllLinodeKernelsRequest,
  getAllLinodesRequest,
} from './requests';

import type {
  APIError,
  Config,
  CreateLinodeRequest,
  DeepPartial,
  Devices,
  Filter,
  Kernel,
  Linode,
  LinodeCloneData,
  MigrateLinodeRequest,
  Params,
  ResizeLinodePayload,
  ResourcePage,
} from '@linode/api-v4';

export const queryKey = 'linodes';

export const linodeQueries = createQueryKeys('linodes', {
  kernel: (kernel: string) => ({
    queryFn: () => getLinodeKernel(kernel),
    queryKey: [kernel],
  }),
  kernels: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAllLinodeKernelsRequest(params, filter),
    queryKey: [params, filter],
  }),
  linode: (linodeId: number) => ({
    contextQueries: {
      configs: {
        queryFn: () => getAllLinodeConfigs(linodeId),
        queryKey: null,
      },
      disks: {
        queryFn: () => getAllLinodeDisks(linodeId),
        queryKey: null,
      },
      firewalls: {
        queryFn: () => getLinodeFirewalls(linodeId),
        queryKey: null,
      },
      lishToken: {
        queryFn: () => getLinodeLishToken(linodeId),
        queryKey: null,
      },
    },
    queryFn: () => getLinode(linodeId),
    queryKey: [linodeId],
  }),
  linodes: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllLinodesRequest(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getLinodes({ page: pageParam, page_size: 25 }, filter),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getLinodes(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});

export const useLinodesQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<ResourcePage<Linode>, APIError[]>({
    ...linodeQueries.linodes._ctx.paginated(params, filter),
    ...queryPresets.longLived,
    enabled,
    keepPreviousData: true,
  });
};

export const useAllLinodesQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<Linode[], APIError[]>({
    ...linodeQueries.linodes._ctx.all(params, filter),
    ...queryPresets.longLived,
    enabled,
  });
};

export const useInfiniteLinodesQuery = (filter: Filter = {}) =>
  useInfiniteQuery<ResourcePage<Linode>, APIError[]>({
    ...linodeQueries.linodes._ctx.infinite(filter),
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
  });

export const useLinodeQuery = (id: number, enabled = true) => {
  return useQuery<Linode, APIError[]>({
    ...linodeQueries.linode(id),
    enabled,
  });
};

export const useLinodeUpdateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Linode, APIError[], DeepPartial<Linode>>({
    mutationFn: (data) => updateLinode(id, data),
    onSuccess(linode) {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
      queryClient.setQueryData(linodeQueries.linode(id).queryKey, linode);
    },
  });
};

export const useAllLinodeKernelsQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true
) => {
  return useQuery<Kernel[], APIError[]>({
    ...linodeQueries.kernels(params, filter),
    enabled,
  });
};

export const useLinodeKernelQuery = (kernel: string) => {
  return useQuery<Kernel, APIError[]>(linodeQueries.kernel(kernel));
};

export const useLinodeLishTokenQuery = (id: number) => {
  return useQuery<{ lish_token: string }, APIError[]>({
    ...linodeQueries.linode(id)._ctx.lishToken,
    staleTime: Infinity,
  });
};

export const useDeleteLinodeMutation = (id: number) => {
  const queryClient = useQueryClient();
  const linode = queryClient.getQueryData<Linode>(
    linodeQueries.linode(id).queryKey
  );
  const placementGroupId = linode?.placement_group?.id;

  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteLinode(id),
    onSuccess() {
      queryClient.removeQueries({
        queryKey: linodeQueries.linode(id).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      // If the linode is assigned to a placement group,
      // we need to invalidate the placement group queries
      if (placementGroupId) {
        queryClient.invalidateQueries({
          queryKey: placementGroupQueries.placementGroup(placementGroupId)
            .queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: placementGroupQueries.all._def,
        });
        queryClient.invalidateQueries({
          queryKey: placementGroupQueries.paginated._def,
        });
      }
    },
  });
};

export const useCreateLinodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Linode, APIError[], CreateLinodeRequest>({
    mutationFn: createLinode,
    onSuccess(linode, variables) {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      queryClient.setQueryData<Linode>(
        linodeQueries.linode(linode.id).queryKey,
        linode
      );

      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });

      if (variables.interfaces?.some((i) => i.purpose === 'vlan')) {
        // If a Linode is created with a VLAN, invalidate vlans because
        // they are derived from Linode configs.
        queryClient.invalidateQueries({ queryKey: vlanQueries._def });
      }

      // If the Linode is assigned to a placement group on creation,
      // we need to invalidate the placement group queries
      if (variables.placement_group?.id) {
        queryClient.invalidateQueries({
          queryKey: placementGroupQueries.placementGroup(
            variables.placement_group.id
          ).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: placementGroupQueries.all._def,
        });
        queryClient.invalidateQueries({
          queryKey: placementGroupQueries.paginated._def,
        });
      }
    },
  });
};

interface LinodeCloneDataWithId extends LinodeCloneData {
  sourceLinodeId: number;
}

export const useCloneLinodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Linode, APIError[], LinodeCloneDataWithId>({
    mutationFn: ({ sourceLinodeId, ...data }) =>
      cloneLinode(sourceLinodeId, data),
    onSuccess(linode) {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
      queryClient.setQueryData<Linode>(
        linodeQueries.linode(linode.id).queryKey,
        linode
      );
    },
  });
};

export const useBootLinodeMutation = (
  id: number,
  configsToUpdate?: Config[]
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { config_id?: number }>({
    mutationFn: ({ config_id }) => linodeBoot(id, config_id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(id).queryKey,
      });

      if (configsToUpdate) {
        /**
         * PR #9893: If booting is successful, we manually set the query config data to have its vpc interfaces as
         * active in order to remove the flickering 'Reboot Needed' status issue. This makes sure the Linode's status
         * shows up as 'Running' right after being booting. Note that the configs query eventually gets invalidated
         * and refetched after the Linode's status changes, ensuring that the actual data will be up to date.
         */
        const updatedConfigs: Config[] = manuallySetVPCConfigInterfacesToActive(
          configsToUpdate
        );
        queryClient.setQueryData<Config[]>(
          [queryKey, 'linode', id, 'configs'],
          updatedConfigs
        );
      }
    },
  });
};

export const useRebootLinodeMutation = (
  id: number,
  configsToUpdate?: Config[]
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { config_id?: number }>({
    mutationFn: ({ config_id }) => linodeReboot(id, config_id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(id).queryKey,
      });
      /**
       * PR #9893: If rebooting is successful, we manually set the query config data to have its vpc interfaces as
       * active in order to remove the flickering 'Reboot Needed' status issue. This makes sure the Linode's status
       * shows up as 'Running' right after being rebooting. Note that the configs query eventually gets invalidated
       * and refetched after the Linode's status changes, ensuring that the actual data will be up to date.
       */
      if (configsToUpdate) {
        const updatedConfigs: Config[] = manuallySetVPCConfigInterfacesToActive(
          configsToUpdate
        );
        queryClient.setQueryData<Config[]>(
          [queryKey, 'linode', id, 'configs'],
          updatedConfigs
        );
      }
    },
  });
};

export const useShutdownLinodeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => linodeShutdown(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(id).queryKey,
      });
    },
  });
};

export const useLinodeChangePasswordMutation = (id: number) =>
  useMutation<{}, APIError[], { root_pass: string }>({
    mutationFn: ({ root_pass }) => changeLinodePassword(id, root_pass),
  });

export const useLinodeMigrateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], MigrateLinodeRequest>({
    mutationFn: (data) => scheduleOrQueueMigration(id, data),
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(id).queryKey,
      });

      if (variables.placement_group?.id) {
        queryClient.invalidateQueries({
          queryKey: placementGroupQueries.placementGroup(
            variables.placement_group.id
          ).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: placementGroupQueries.all._def,
        });
        queryClient.invalidateQueries({
          queryKey: placementGroupQueries.paginated._def,
        });
      }
    },
  });
};

export const useLinodeResizeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], ResizeLinodePayload>({
    mutationFn: (data) => resizeLinode(id, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(id).queryKey,
      });

      queryClient.invalidateQueries(accountQueries.notifications.queryKey);
    },
  });
};

export const useLinodeRescueMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], Devices>({
    mutationFn: (data) => rescueLinode(id, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(id).queryKey,
      });
    },
  });
};
