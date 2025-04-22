import { linodeQueries, useAddFirewallDeviceMutation } from '@linode/queries';
import { ActionsPanel, Drawer } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';

interface Props {
  interfaceId: number | undefined;
  linodeId: number;
  open: boolean;
  onClose: () => void;
}

export const AssignFirewallDrawer = (props: Props) => {
  const { interfaceId, linodeId, open, onClose } = props;

  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [selectedFirewallId, setSelectedFirewallId] = useState<number>();
  const { mutateAsync: createFirewallDevice, isPending } =
    useAddFirewallDeviceMutation();

  const handleClose = () => {
    onClose();
    setSelectedFirewallId(undefined)
  };

  const onAssign = async () => {
    if (!selectedFirewallId || !interfaceId) {
      return;
    }

    await createFirewallDevice({
      firewallId: selectedFirewallId,
      id: interfaceId,
      type: 'interface',
    });

    enqueueSnackbar('Successfully assigned firewall.', { variant: 'success' });

    queryClient.invalidateQueries({
      queryKey: linodeQueries
        .linode(linodeId)
        ._ctx.interfaces._ctx.interface(interfaceId ?? 0)._ctx.firewalls
        .queryKey,
    });

    handleClose();
  };

  return (
    <Drawer onClose={handleClose} open={open} title="Assign Firewall">
      <FirewallSelect
        onChange={(e, firewall) => setSelectedFirewallId(firewall?.id)}
        value={selectedFirewallId}
      />
      <ActionsPanel
        primaryButtonProps={{
          label: 'Assign',
          loading: isPending,
          onClick: onAssign,
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: handleClose,
        }}
      />
    </Drawer>
  );
};
