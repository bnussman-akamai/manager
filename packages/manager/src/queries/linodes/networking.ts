import {
  allocateIPAddress,
  assignAddresses,
  createIPv6Range,
  getIPv6RangeInfo,
  removeIPAddress,
  removeIPv6Range,
  shareAddresses,
  updateIP,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { linodeQueries } from './linodes';
import { getAllIPv6Ranges, getAllIps } from './requests';

import type {
  APIError,
  CreateIPv6RangePayload,
  Filter,
  IPAddress,
  IPAllocationRequest,
  IPAssignmentPayload,
  IPRange,
  IPRangeInformation,
  IPSharingPayload,
  Linode,
  LinodeIPsResponse,
  Params,
} from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';

export const useLinodeIPsQuery = (
  linodeId: number,
  enabled: boolean = true
) => {
  return useQuery<LinodeIPsResponse, APIError[]>({
    ...linodeQueries.linode(linodeId)._ctx.ips,
    enabled,
  });
};

export const useLinodeIPMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IPAddress,
    APIError[],
    { address: string; rdns?: null | string }
  >({
    mutationFn: ({ address, rdns }) => updateIP(address, rdns),
    onSuccess() {
      invalidateAllIPsQueries(queryClient);
    },
  });
};

const ipQueries = createQueryKeys('ips', {
  all: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAllIps(params, filter),
    queryKey: [params, filter],
  }),
  ipv6: {
    contextQueries: {
      detailedRegions: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => null,
        queryKey: [params, filter],
      }),
      ranges: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllIPv6Ranges(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});

export const useLinodeIPDeleteMutation = (
  linodeId: number,
  address: string
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => removeIPAddress({ address, linodeID: linodeId }),
    onSuccess() {
      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.ips.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
      queryClient.invalidateQueries({ queryKey: ipQueries._def });
    },
  });
};

export const useLinodeRemoveRangeMutation = (range: string) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => removeIPv6Range({ range }),
    onSuccess() {
      invalidateAllIPsQueries(queryClient);
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
      queryClient.invalidateQueries({ queryKey: ipQueries._def });
    },
  });
};

export const useLinodeShareIPMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPSharingPayload>(shareAddresses, {
    onSuccess() {
      invalidateAllIPsQueries(queryClient);
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
    },
  });
};

export const useAssignAdressesMutation = ({
  currentLinodeId,
}: {
  currentLinodeId: Linode['id'];
}) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPAssignmentPayload>({
    mutationFn: assignAddresses,
    onSuccess(_, variables) {
      for (const { linode_id } of variables.assignments) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(linode_id).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linode_id)._ctx.ips.queryKey,
        });
      }

      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(currentLinodeId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(currentLinodeId)._ctx.ips.queryKey,
      });
      queryClient.invalidateQueries({ queryKey: ipQueries._def });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
    },
  });
};

export const useAllocateIPMutation = (linodeId: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPAllocationRequest>({
    mutationFn: (data) => allocateIPAddress(linodeId, data),
    onSuccess() {
      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.ips.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
      queryClient.invalidateQueries({ queryKey: ipQueries._def });
    },
  });
};

export const useCreateIPv6RangeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], CreateIPv6RangePayload>(createIPv6Range, {
    onSuccess(_, variables) {
      queryClient.invalidateQueries({ queryKey: ipQueries._def });
      if (variables.linode_id) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(variables.linode_id).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(variables.linode_id)._ctx.ips.queryKey,
        });
      }
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
    },
  });
};

export const useAllIPsQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true
) => {
  return useQuery<IPAddress[], APIError[]>({
    ...ipQueries.all(params, filter),
    enabled,
  });
};

export const useAllIPv6RangesQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true
) => {
  return useQuery<IPRange[], APIError[]>({
    ...ipQueries.ipv6._ctx.ranges(params, filter),
    enabled,
  });
};

export const useAllDetailedIPv6RangesQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true
) => {
  const { data: ranges } = useAllIPv6RangesQuery(params, filter, enabled);
  return useQuery<IPRangeInformation[], APIError[]>({
    enabled: ranges !== undefined && enabled,
    queryFn: async () => {
      return await Promise.all(
        (ranges ?? []).map((range) => getIPv6RangeInfo(range.range))
      );
    },
    queryKey: ipQueries.ipv6._ctx.detailedRegions(params, filter).queryKey,
  });
};

const invalidateAllIPsQueries = (queryClient: QueryClient) => {
  // Because IPs may be shared between Linodes, we can't simpily invalidate one store.
  // Here, we look at all of our active query keys, and invalidate any queryKey that contains 'ips'.
  queryClient.invalidateQueries({
    predicate: (query) => {
      if (Array.isArray(query.queryKey)) {
        return query.queryKey[0] === 'linodes' && query.queryKey[3] === 'ips';
      }
      return false;
    },
  });
};
