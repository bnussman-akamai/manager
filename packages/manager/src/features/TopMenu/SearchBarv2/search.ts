import { getAPIFilterFromQuery } from '@linode/search';

import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import { useInfiniteDatabasesQuery } from 'src/queries/databases/databases';
import { useInfiniteFirewallsQuery } from 'src/queries/firewalls';
import { useInfiniteImagesQuery } from 'src/queries/images';
import { useInfiniteKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useInfiniteLinodesQuery } from 'src/queries/linodes/linodes';
import { useInfiniteNodebalancersQuery } from 'src/queries/nodebalancers';
import { useInfinitePlacementGroupsQuery } from 'src/queries/placementGroups';
import { useStackScriptsInfiniteQuery } from 'src/queries/stackscripts';
import { useInfiniteVolumesQuery } from 'src/queries/volumes/volumes';
import { useInfiniteVPCsQuery } from 'src/queries/vpcs/vpcs';

import type {
  DatabaseInstance,
  Firewall,
  Image,
  KubernetesCluster,
  Linode,
  NodeBalancer,
  PlacementGroup,
  StackScript,
  VPC,
  Volume,
} from '@linode/api-v4';

const entities = [
  {
    name: 'Linode',
    query: useInfiniteLinodesQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label', 'tags', 'ipv4'],
    },
  },
  {
    name: 'Volume',
    query: useInfiniteVolumesQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label', 'tags'] },
  },
  {
    name: 'NodeBalancer',
    query: useInfiniteNodebalancersQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label', 'tags'] },
  },
  {
    name: 'VPC',
    query: useInfiniteVPCsQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    name: 'Firewall',
    query: useInfiniteFirewallsQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    baseQuery: { mine: true },
    name: 'StackScript',
    query: useStackScriptsInfiniteQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    baseQuery: { is_public: false },
    name: 'Image',
    query: useInfiniteImagesQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    name: 'Placement Group',
    query: useInfinitePlacementGroupsQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    name: 'Database',
    query: useInfiniteDatabasesQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    name: 'Kubernetes Cluster',
    query: useInfiniteKubernetesClustersQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
];

export const useSearch = (query: string) => {
  const deboundedQuery = useDebouncedValue(query);

  const result = entities.map((entity) => {
    const { error, filter } = getAPIFilterFromQuery(
      deboundedQuery,
      entity.searchOptions
    );
    return {
      ...entity,
      parseError: error,
      ...entity.query(
        entity.baseQuery ? { ...filter, ...entity.baseQuery } : filter,
        Boolean(query) && error === null
      ),
    };
  });

  const isLoading = result.some((r) => r.isFetching);

  const entitiesThatErroredWhenAPIFiltering = result
    .filter((r) => r.error)
    .map((r) => ({ error: r.error![0].reason, name: r.name }));

  const entitiesThatCouldBeAPIFiltered = entities
    .filter(
      (e) => !entitiesThatErroredWhenAPIFiltering.find((i) => i.name === e.name)
    )
    .map((e) => e.name);

  const parsingError = result.find((r) => r.parseError)?.parseError;

  const data = result.flatMap(
    (r) =>
      r.data?.pages.flatMap<
        | DatabaseInstance
        | Firewall
        | Image
        | KubernetesCluster
        | Linode
        | NodeBalancer
        | PlacementGroup
        | StackScript
        | VPC
        | Volume
      >((p) => p.data) ?? []
  );

  return {
    data,
    entitiesThatCouldBeAPIFiltered,
    entitiesThatErroredWhenAPIFiltering,
    isLoading,
    parsingError,
  };
};
