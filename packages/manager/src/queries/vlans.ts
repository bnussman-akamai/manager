import { getVlans } from '@linode/api-v4/lib/vlans';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import type { APIError, Filter, ResourcePage, VLAN } from '@linode/api-v4';

export const queryKey = 'vlans';

const getAllVLANs = (): Promise<VLAN[]> =>
  getAll<VLAN>((params) => getVlans(params))().then(({ data }) => data);

export const vlanQueries = createQueryKeys('vlans', {
  all: {
    queryFn: getAllVLANs,
    queryKey: null,
  },
  infinite: (filter: Filter = {}) => ({
    queryFn: ({ pageParam = 0 }) =>
      getVlans({ page: pageParam, page_size: 25 }),
    queryKey: [filter],
  }),
});

export const useVlansQuery = () => {
  return useQuery<VLAN[], APIError[]>(vlanQueries.all);
};

export const useVLANsInfiniteQuery = (filter: Filter = {}) => {
  return useInfiniteQuery<ResourcePage<VLAN>, APIError[]>({
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    keepPreviousData: true,
    ...vlanQueries.infinite(filter),
  });
};
