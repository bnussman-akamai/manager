import { getFormattedStatus } from '@linode/utilities';

import { useInProgressEvents } from 'src/queries/events/events';

import type {
  Disk,
  Event,
  EventAction,
  Linode,
  LinodeStatus,
} from '@linode/api-v4';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

export const sshLink = (ipv4: string) => {
  return `ssh root@${ipv4}`;
};

export const lishLink = (
  username: string,
  region: string,
  linodeLabel: string
) => {
  return `ssh -t ${username}@lish-${region}.linode.com ${linodeLabel}`;
};

export const getSelectedDeviceOption = (
  selectedValue: null | string,
  optionList: { deviceType: string; label: string; value: any }[]
) => {
  if (!selectedValue) {
    return null;
  }
  return optionList.find((option) => option.value === selectedValue) || null;
};

export const addUsedDiskSpace = (disks: Disk[]) => {
  return disks.reduce((accum, eachDisk) => eachDisk.size + accum, 0);
};

export const LINODE_STATUS_TO_STATUS_ICON_MAP: Record<LinodeStatus, Status> = {
  booting: 'other',
  cloning: 'other',
  deleting: 'other',
  migrating: 'other',
  offline: 'inactive',
  provisioning: 'other',
  rebooting: 'other',
  rebuilding: 'other',
  restoring: 'other',
  running: 'active',
  shutting_down: 'other',
  stopped: 'error',
  resizing: 'other',
  billing_suspension: 'error',
};

export const LINODE_EVENT_TO_STATUS_MAP: Partial<
  Record<EventAction, LinodeStatus>
> = {
  backups_restore: 'restoring',
  linode_boot: 'booting',
  linode_clone: 'cloning',
  linode_create: 'provisioning',
  linode_delete: 'deleting',
  linode_migrate_datacenter: 'migrating',
  linode_migrate: 'migrating',
  linode_mutate: 'migrating',
  linode_poweroff_on: 'rebooting',
  linode_reboot: 'rebooting',
  linode_rebuild: 'rebuilding',
  linode_resize: 'resizing',
  linode_shutdown: 'shutting_down',
};

export const EVENT_TO_SECONDARY_LINODE_STATUS = {
  disk_duplicate: 'Disk Duplicating',
  disk_imagize: 'Capturing Image',
  disk_resize: 'Disk Resizing',
  linode_snapshot: 'Snapshot',
} as const;

function getDerivedLinodeStatusFromStatusAndEvent(
  status: LinodeStatus,
  event: Event | undefined
) {
  if (event && LINODE_EVENT_TO_STATUS_MAP[event.action]) {
    return LINODE_EVENT_TO_STATUS_MAP[event.action] ?? status;
  }

  return status;
}

export const useLinodeStatus = (options: Pick<Linode, 'id' | 'status'>) => {
  const { data: events } = useInProgressEvents();

  const event = events?.find(
    (e) =>
      ((e.entity?.type === 'linode' && e.entity.id === options.id) ||
        (e.secondary_entity?.type === 'linode' &&
          e.secondary_entity.id === options.id)) &&
      e.percent_complete !== null &&
      e.percent_complete !== 100
  );

  const status = getDerivedLinodeStatusFromStatusAndEvent(
    options.status,
    event
  );

  const statusIcon = LINODE_STATUS_TO_STATUS_ICON_MAP[status];

  const secondaryStatus = event
    ? EVENT_TO_SECONDARY_LINODE_STATUS[
        event.action as keyof typeof EVENT_TO_SECONDARY_LINODE_STATUS
      ]
    : undefined;

  const formattedStatus = getFormattedStatus(status);

  return { status, event, statusIcon, secondaryStatus, formattedStatus };
};
