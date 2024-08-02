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
    name: 'Linode' as const,
    query: useInfiniteLinodesQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label', 'tags', 'ipv4'],
    },
  },
  {
    name: 'Volume' as const,
    query: useInfiniteVolumesQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label', 'tags'] },
  },
  {
    name: 'NodeBalancer' as const,
    query: useInfiniteNodebalancersQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label', 'tags', 'ipv4'],
    },
  },
  {
    name: 'VPC' as const,
    query: useInfiniteVPCsQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    name: 'Firewall' as const,
    query: useInfiniteFirewallsQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    baseQuery: { mine: true },
    name: 'StackScript' as const,
    query: useStackScriptsInfiniteQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    baseQuery: { is_public: false },
    name: 'Image' as const,
    query: useInfiniteImagesQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    name: 'Placement Group' as const,
    query: useInfinitePlacementGroupsQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    name: 'Database' as const,
    query: useInfiniteDatabasesQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
  {
    name: 'Kubernetes Cluster' as const,
    query: useInfiniteKubernetesClustersQuery,
    searchOptions: { searchableFieldsWithoutOperator: ['label'] },
  },
];

type Entity = typeof entities[number]['name'];

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
        (
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
        ) & { entity: Entity }
      >((p) => p.data.map((i) => ({ ...i, entity: r.name }))) ?? []
  );

  return {
    data,
    entitiesThatCouldBeAPIFiltered,
    entitiesThatErroredWhenAPIFiltering,
    isLoading,
    parsingError,
  };
};
