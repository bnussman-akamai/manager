import { ServiceTarget } from '@linode/api-v4';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLoadBalancerServiceTargetDeleteMutation } from 'src/queries/aclb/serviceTargets';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
  serviceTarget: ServiceTarget | undefined;
}

export const DeleteServiceTargetDialog = (props: Props) => {
  const { loadbalancerId, onClose: _onClose, open, serviceTarget } = props;

  const {
    error,
    isLoading,
    mutateAsync,
    reset,
  } = useLoadBalancerServiceTargetDeleteMutation(
    loadbalancerId,
    serviceTarget?.id ?? -1
  );

  const onClose = () => {
    // Clear the error when the dialog closes so that is does not persist
    reset();
    _onClose();
  };

  const onDelete = async () => {
    try {
      await mutateAsync();
    } finally {
      onClose();
    }
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Delete',
            loading: isLoading,
            onClick: onDelete,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      }
      error={error?.[0]?.reason}
      onClose={onClose}
      open={open}
      title={`Delete Service Target ${serviceTarget?.label}?`}
    >
      Are you sure you want to delete this Service Target?
    </ConfirmationDialog>
  );
};
