import {
  firewallQueries,
  useLinodeInterfaceFirewallsQuery,
  useLinodeInterfaceQuery,
  useRemoveFirewallDeviceMutation,
} from '@linode/queries';
import { Button, Typography } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import React from 'react';

import { Code } from 'src/components/Code/Code';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { getLinodeInterfaceType } from './utilities';

interface Props {
  interfaceId: number | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const UnassignFirewallConfirmationDialog = (props: Props) => {
  const { interfaceId, linodeId, open, onClose } = props;

  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: linodeInterface } = useLinodeInterfaceQuery(
    linodeId,
    interfaceId,
    interfaceId !== undefined
  );

  const { data: firewalls } = useLinodeInterfaceFirewallsQuery(
    linodeId,
    interfaceId ?? -1,
    interfaceId !== undefined
  );

  const { mutateAsync: deleteDevice, isPending } = useRemoveFirewallDeviceMutation();

  const firewall = firewalls?.data[0];

  const interfaceType =
    linodeInterface && getLinodeInterfaceType(linodeInterface);

  const onUnassign = async () => {
    if (!firewall) {
      return enqueueSnackbar('Unable to load Firewalls for this Interface.', {
        variant: 'error',
      });
    }

    const devices = await queryClient.ensureQueryData(
      firewallQueries.firewall(firewall.id)._ctx.devices
    );

    const device = devices.find(
      (device) =>
        device.entity.id === interfaceId && device.entity.type === 'interface'
    );

    if (!device) {
      return enqueueSnackbar(
        'Unable to find Interface in the Firewall devices.',
        {
          variant: 'error',
        }
      );
    }

    await deleteDevice({ firewallId: firewall.id, deviceId: device.id });
    enqueueSnackbar(
      `Firewall ${firewall.label} has been unassined from your ${interfaceType} interface.`,
      {
        variant: 'success',
      }
    );
    onClose();
  };

  return (
    <ConfirmationDialog
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button buttonType="primary" loading={isPending} onClick={onUnassign}>
            Unassign
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      title="Unassign Firewall?"
    >
      <Typography>
        Are you sure you want to unassign Firewall{' '}
        <Code>{firewall?.label ?? ''}</Code> from your {interfaceType}{' '}
        interface?
      </Typography>
    </ConfirmationDialog>
  );
};
