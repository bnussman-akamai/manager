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
    useInfiniteVolumesQuery(apiFilter, shouldSearch),
    useInfiniteLinodesQuery(apiFilter, shouldSearch),
    useInfiniteNodebalancersQuery(apiFilter, shouldSearch),
  ];

  const isLoading = queries.some((q) => q.isFetching);

  const data = queries.flatMap<Linode | NodeBalancer | Volume>(
    // @ts-expect-error dumb TS
    (q) => q.data?.pages.flatMap((page) => page.data) ?? []
  );

  return { data, isLoading, isQueryInvalid, queryParseError };
}
