import { generate } from 'peggy';

import { useInfiniteLinodesQuery } from 'src/queries/linodes/linodes';
import { useInfiniteNodebalancersQuery } from 'src/queries/nodebalancers';
import { useInfiniteVolumesQuery } from 'src/queries/volumes';

import grammar from './search.peggy?raw';

import type { Filter, Linode, NodeBalancer, Volume } from '@linode/api-v4';

const parser = generate(grammar);

export function useSearch(query: string) {
  let apiFilter: Filter = {};
  let queryParseError = '';

  try {
    apiFilter = parser.parse(query);
  } catch (error) {
    queryParseError = error.message;
  }

  const isQueryInvalid = Boolean(queryParseError);
  const shouldSearch = Boolean(query) && !isQueryInvalid;

  const queries = [
    {
      entity: 'volume' as const,
      query: useInfiniteVolumesQuery(apiFilter, shouldSearch),
    },
    {
      entity: 'linode' as const,
      query: useInfiniteLinodesQuery(apiFilter, shouldSearch),
    },
    {
      entity: 'nodebalancer' as const,
      query: useInfiniteNodebalancersQuery(apiFilter, shouldSearch),
    },
  ];

  const isLoading = queries.some((q) => q.query.isFetching);

  const hasMorePages = queries.some((q) => q.query.hasNextPage);

  const loadNextPages = () => {
    for (const { query } of queries) {
      if (query.hasNextPage) {
        query.fetchNextPage();
      }
    }
  };

  const getData = () => {
    const items: ({ entityName: 'volume' | 'linode' | 'nodebalancer' } & (Volume | Linode | NodeBalancer))[] = [];
    for (const query of queries) {
      for (const page of query.query.data?.pages ?? []) {
        for (const item of page.data) {
          items.push({ entityName: query.entity, ...item });
        }
      }
    }
    return items;
  };

  const data = getData();

  return {
    data,
    hasMorePages,
    isLoading,
    isQueryInvalid,
    loadNextPages,
    queryParseError,
  };
}
