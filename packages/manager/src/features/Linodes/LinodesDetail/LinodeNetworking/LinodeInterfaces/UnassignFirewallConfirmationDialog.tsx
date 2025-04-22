import {
  firewallQueries,
  linodeQueries,
  useLinodeInterfaceFirewallsQuery,
  useLinodeInterfaceQuery,
  useRemoveFirewallDeviceMutation,
} from '@linode/queries';
import { Button, Stack, Typography } from '@linode/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import React from 'react';

import { Code } from 'src/components/Code/Code';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { getLinodeInterfaceType } from './utilities';

import type { APIError, Firewall } from '@linode/api-v4';

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

  const { mutateAsync: deleteDevice } = useRemoveFirewallDeviceMutation();

  const firewall = firewalls?.data[0];

  const interfaceType =
    linodeInterface && getLinodeInterfaceType(linodeInterface);

  const handleClose = () => {
    reset();
    onClose();
  };

  const {
    mutate: onUnassign,
    error,
    isPending,
    reset,
  } = useMutation<Firewall, APIError[]>({
    async mutationFn() {
      if (!firewall) {
        return Promise.reject([
          {
            reason: "Unable to determine this Interface's Firewall. Refresh and try again.",
          },
        ]);
      }

      const devices = await queryClient.ensureQueryData(
        firewallQueries.firewall(firewall.id)._ctx.devices
      );

      const device = devices.find(
        (device) =>
          device.entity.id === interfaceId && device.entity.type === 'interface'
      );

      if (!device) {
        return Promise.reject([
          {
            reason:
              "Interface does not appear to be a device on this Interface's Firewall. Refresh and try again.",
          },
        ]);
      }

      await deleteDevice({ firewallId: firewall.id, deviceId: device.id });

      return firewall;
    },
    onSuccess(firewall) {
      enqueueSnackbar(
        `Firewall ${firewall.label} has been unassigned from your ${interfaceType} interface.`,
        {
          variant: 'success',
        }
      );
      queryClient.invalidateQueries({
        queryKey: linodeQueries
          .linode(linodeId)
          ._ctx.interfaces._ctx.interface(interfaceId ?? 0)._ctx.firewalls
          .queryKey,
      });
      handleClose();
    },
  });

  return (
    <ConfirmationDialog
      actions={
        <Stack direction="row" pt={1} spacing={1}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            buttonType="primary"
            loading={isPending}
            onClick={() => onUnassign()}
          >
            Unassign
          </Button>
        </Stack>
      }
      error={error?.[0].reason}
      onClose={handleClose}
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
