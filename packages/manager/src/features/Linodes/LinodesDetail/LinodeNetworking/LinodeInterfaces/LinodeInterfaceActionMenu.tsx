import { useLinodeInterfaceFirewallsQuery } from '@linode/queries';
import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { LinodeInterfaceType } from './utilities';

interface Props {
  handlers: InterfaceActionHandlers;
  id: number;
  linodeId: number;
  type: LinodeInterfaceType;
}

export interface InterfaceActionHandlers {
  onDelete: (interfaceId: number) => void;
  onEdit: (interfaceId: number) => void;
  onShowDetails: (interfaceId: number) => void;
  onUnassignFirewall: (interfaceId: number) => void;
}

export const LinodeInterfaceActionMenu = (props: Props) => {
  const { handlers, id, type, linodeId } = props;

  const { data: firewalls } = useLinodeInterfaceFirewallsQuery(linodeId, id);

  const numberOfFirewalls = firewalls?.results ?? 0;

  const editOptions =
    type === 'VLAN'
      ? {
          disabled: true,
          tooltip: 'VLAN interfaces cannot be edited.',
        }
      : {};

  const actions = [
    { onClick: () => handlers.onShowDetails(id), title: 'Details' },
    {
      onClick: () => handlers.onEdit(id),
      title: 'Edit',
      ...editOptions,
    },
    ...(numberOfFirewalls > 0
      ? [
          {
            onClick: () => handlers.onUnassignFirewall(id),
            title: 'Unassign Firewall',
          },
        ]
      : []),
    { onClick: () => handlers.onDelete(id), title: 'Delete' },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for ${type} Interface (${id})`}
    />
  );
};
