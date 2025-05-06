import {
  getNodeBalancerConfigNodes,
  getNodeBalancerConfigs,
} from '@linode/api-v4';
import {
  useGrants,
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
  useQuery,
  useQueryClient,
} from '@linode/queries';
import { CircleProgress, ErrorState, Notice } from '@linode/ui';
import { useMatch, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useTabs } from 'src/hooks/useTabs';
import { getErrorMap } from 'src/utilities/errorUtils';

import { parseAddresses } from '../utils';
import { NodeBalancerConfigurations } from './NodeBalancerConfigurations';
import { NodeBalancerSettings } from './NodeBalancerSettings';
import { NodeBalancerSummary } from './NodeBalancerSummary/NodeBalancerSummary';

import type { APIError } from '@linode/api-v4';

export const NodeBalancerDetail = () => {
  const { id } = useParams({
    strict: false,
  });
  const [label, setLabel] = React.useState<string>();

  const { error: updateError, mutateAsync: updateNodeBalancer } =
    useNodebalancerUpdateMutation(Number(id));

  const {
    data: nodebalancer,
    error,
    isLoading,
  } = useNodeBalancerQuery(Number(id), Boolean(id));

  const isNodeBalancerReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'nodebalancer',
    id: nodebalancer?.id,
  });

  React.useEffect(() => {
    if (label !== nodebalancer?.label) {
      setLabel(nodebalancer?.label);
    }
  }, [nodebalancer]);

  const cancelUpdate = () => {
    setLabel(nodebalancer?.label);
  };

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Summary',
      to: '/nodebalancers/$id/summary',
    },
    {
      title: 'Configurations',
      to: '/nodebalancers/$id/configurations',
    },
    {
      title: 'Settings',
      to: '/nodebalancers/$id/settings',
    },
  ]);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState errorText="There was an error retrieving your NodeBalancer. Please reload and try again." />
    );
  }

  if (!nodebalancer) {
    return null;
  }

  const errorMap = getErrorMap(['label'], updateError);
  const labelError = errorMap.label;

  const nodeBalancerLabel = label !== undefined ? label : nodebalancer?.label;

  return (
    <React.Fragment>
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [{ label: 'NodeBalancers', position: 1 }],
          firstAndLastOnly: true,
          onEditHandlers: {
            editableTextTitle: nodeBalancerLabel,
            errorText: labelError,
            onCancel: cancelUpdate,
            onEdit: (label) => updateNodeBalancer({ label }),
          },
          pathname: `/nodebalancers/${nodeBalancerLabel}`,
        }}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-nodebalancers"
        title={nodeBalancerLabel}
      />
      {errorMap.none && <Notice text={errorMap.none} variant="error" />}
      {isNodeBalancerReadOnly && (
        <Notice
          text={getRestrictedResourceText({
            resourceType: 'NodeBalancers',
          })}
          variant="warning"
        />
      )}
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <NodeBalancerSummary />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <NodeBalancerConfigurationWrapper />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <NodeBalancerSettings />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};

const getConfigsWithNodes = (nodeBalancerId: number) => {
  return getNodeBalancerConfigs(nodeBalancerId).then((configs) => {
    return Promise.all(
      configs.data.map((config) => {
        return getNodeBalancerConfigNodes(nodeBalancerId, config.id).then(
          ({ data: nodes }) => {
            return {
              ...config,
              nodes: parseAddresses(nodes),
            };
          }
        );
      })
    );
  });
};

export type NodeBalancerConfigsWithNodes = Awaited<
  ReturnType<typeof getConfigsWithNodes>
>;

const NodeBalancerConfigurationWrapper = () => {
  const { configId, id: nodeBalancerId } = useParams({
    strict: false,
  });
  const match = useMatch({
    strict: false,
  });

  const queryClient = useQueryClient();

  const { data: grants } = useGrants();

  const { data: nodebalancer } = useNodeBalancerQuery(Number(nodeBalancerId));

  const { data, isPending, error } = useQuery<
    NodeBalancerConfigsWithNodes,
    APIError[]
  >({
    queryKey: [
      'nodebalancers',
      'nodebalancer',
      nodeBalancerId,
      'configs-with-nodes',
    ],
    queryFn: () => getConfigsWithNodes(Number(nodeBalancerId)),
    refetchOnMount: true,
    enabled: Boolean(nodeBalancerId),
  });

  if (
    (match.routeId === '/nodebalancers/$id/configurations' &&
      !nodeBalancerId) ||
    (!configId &&
      match.routeId === '/nodebalancers/$id/configurations/$configId')
  ) {
    return null;
  }

  if (isPending) {
    return <CircleProgress />;
  }
  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  return (
    <NodeBalancerConfigurations
      configs={data}
      grants={grants}
      nodeBalancerLabel={nodebalancer?.label ?? ''}
      nodeBalancerRegion={nodebalancer?.region ?? ''}
      params={{ configId, id: Number(nodeBalancerId) }}
      queryClient={queryClient}
    />
  );
};

export default NodeBalancerDetail;
