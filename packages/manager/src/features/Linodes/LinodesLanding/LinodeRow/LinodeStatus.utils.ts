import type { EventAction, LinodeStatus } from '@linode/api-v4';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

export const LINODE_EVENT_TO_STATUS_MAP: Partial<Record<EventAction, string>> =
  {
    backups_restore: 'Backups Restore',
    disk_duplicate: 'Disk Duplicating',
    disk_imagize: 'Capturing Image',
    disk_resize: 'Disk Resizing',
    linode_clone: 'Cloning',
    linode_migrate_datacenter: 'Migrating',
    linode_migrate: 'Migrating',
    linode_mutate: 'Upgrading',
    linode_rebuild: 'Rebuilding',
    linode_resize: 'Resizing',
    linode_snapshot: 'Snapshot',
    linode_boot: 'Booting',
    linode_create: 'Creating',
    linode_shutdown: 'Shutting Down',
    linode_poweroff_on: 'Rebooting for Maintenance',
    linode_reboot: 'Rebooting',
    lassie_reboot: 'Rebooting',
    firewall_apply: 'Firewall Applying',
    lish_boot: 'Booting',
  };

export const LINODE_STATUS_TO_STATUS_ICON: Record<LinodeStatus, Status> = {
  booting: 'other',
  cloning: 'other',
  migrating: 'other',
  offline: 'inactive',
  provisioning: 'other',
  rebooting: 'other',
  restoring: 'other',
  running: 'active',
  shutting_down: 'other',
  deleting: 'other',
  rebuilding: 'other',
  stopped: 'error',
};
