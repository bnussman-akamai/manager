import { getAPIFilterFromQuery } from '@linode/search';
import React, { useState } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
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

export const SearchBarv2 = () => {
  const [query, setQuery] = useState('');

  const debouncedQuery = useDebouncedValue(query);

  const { filter, error } = getAPIFilterFromQuery(debouncedQuery, {
    searchableFieldsWithoutOperator: ['label'],
  });

  const {
    data: linodesData,
    isLoading: linodesLoading,
  } = useInfiniteLinodesQuery(filter);

  const {
    data: volumesData,
    isLoading: volumesLoading,
  } = useInfiniteVolumesQuery(filter);

  const {
    data: nodebalancersData,
    isLoading: nodebalancerLoading,
  } = useInfiniteNodebalancersQuery(filter);

  const {
    data: stackscriptsData,
    isLoading: stackscriptsLoading,
  } = useStackScriptsInfiniteQuery({ ...filter, mine: true });

  const {
    data: firewallsData,
    isLoading: firewallsLoading,
  } = useInfiniteFirewallsQuery(filter);

  const {
    data: imagesData,
    isLoading: imagesLoading,
  } = useInfiniteImagesQuery({ ...filter, is_public: false });

  const {
    data: placementGroupsData,
    isLoading: placemenGroupsLoading,
  } = useInfinitePlacementGroupsQuery(filter);

  const {
    data: databasesData,
    isLoading: databasesLoading,
  } = useInfiniteDatabasesQuery(filter);

  const {
    data: kubernetesData,
    isLoading: kubernetesLoading,
  } = useInfiniteKubernetesClustersQuery(filter);

  const { data: vpcsData, isLoading: vpcsLoading } = useInfiniteVPCsQuery(
    filter
  );

  const linodes = linodesData?.pages.flatMap((page) => page.data) ?? [];
  const volumes = volumesData?.pages.flatMap((page) => page.data) ?? [];
  const firewalls = firewallsData?.pages.flatMap((page) => page.data) ?? [];
  const databases = databasesData?.pages.flatMap((page) => page.data) ?? [];
  const vpcs = vpcsData?.pages.flatMap((page) => page.data) ?? [];
  const images = imagesData?.pages.flatMap((page) => page.data) ?? [];
  const stackscripts =
    stackscriptsData?.pages.flatMap((page) => page.data) ?? [];
  const nodebalancers =
    nodebalancersData?.pages.flatMap((page) => page.data) ?? [];
  const placementGroups =
    placementGroupsData?.pages.flatMap((page) => page.data) ?? [];
  const kubernetesClusters =
    kubernetesData?.pages.flatMap((page) => page.data) ?? [];

  const options = [
    ...linodes,
    ...volumes,
    ...nodebalancers,
    ...stackscripts,
    ...firewalls,
    ...vpcs,
    ...images,
    ...placementGroups,
    ...databases,
    ...kubernetesClusters,
  ];

  const isLoading =
    linodesLoading ||
    volumesLoading ||
    nodebalancerLoading ||
    stackscriptsLoading ||
    firewallsLoading ||
    vpcsLoading ||
    imagesLoading ||
    placemenGroupsLoading ||
    databasesLoading ||
    kubernetesLoading;

  return (
    <Autocomplete
      textFieldProps={{
        hideLabel: true,
      }}
      filterOptions={(x) => x}
      fullWidth
      inputValue={query}
      label="Search"
      loading={isLoading}
      onInputChange={(e, value) => setQuery(value)}
      options={options}
      placeholder="Search"
    />
  );
};
