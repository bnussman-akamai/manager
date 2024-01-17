import type { Event } from '@linode/api-v4/lib/account';

export const EVENT_ACTIONS: Event['action'][] = [
  'account_settings_update',
  'account_update',
  'backups_cancel',
  'backups_enable',
  'backups_restore',
  'community_like',
  'community_mention',
  'community_question_reply',
  'credit_card_updated',
  'database_backup_restore',
  'database_create',
  'database_credentials_reset',
  'database_delete',
  'database_update_failed',
  'database_update',
  'database_scale',
  'disk_create',
  'disk_delete',
  'disk_duplicate',
  'disk_imagize',
  'disk_resize',
  'disk_update',
  'domain_create',
  'domain_delete',
  'domain_record_create',
  'domain_record_delete',
  'domain_record_updated',
  'domain_update',
  'entity_transfer_accept',
  'entity_transfer_cancel',
  'entity_transfer_create',
  'entity_transfer_fail',
  'entity_transfer_stale',
  'firewall_create',
  'firewall_delete',
  'firewall_device_add',
  'firewall_device_remove',
  'firewall_disable',
  'firewall_enable',
  'firewall_update',
  'host_reboot',
  'image_delete',
  'image_update',
  'image_upload',
  'lassie_reboot',
  'linode_addip',
  'linode_boot',
  'linode_clone',
  'linode_config_create',
  'linode_config_delete',
  'linode_config_update',
  'linode_create',
  'linode_delete',
  'linode_deleteip',
  'linode_migrate_datacenter_create',
  'linode_migrate_datacenter',
  'linode_migrate',
  'linode_mutate_create',
  'linode_mutate',
  'linode_reboot',
  'linode_rebuild',
  'linode_resize_create',
  'linode_resize_warm_create',
  'linode_resize',
  'linode_shutdown',
  'linode_snapshot',
  'linode_update',
  'lke_node_create',
  'longviewclient_create',
  'longviewclient_delete',
  'longviewclient_update',
  'nodebalancer_config_create',
  'nodebalancer_config_delete',
  'nodebalancer_config_update',
  'nodebalancer_create',
  'nodebalancer_delete',
  'nodebalancer_update',
  'password_reset',
  'profile_update',
  'stackscript_create',
  'stackscript_delete',
  'stackscript_publicize',
  'stackscript_revise',
  'stackscript_update',
  'subnet_create',
  'subnet_delete',
  'subnet_update',
  'tfa_disabled',
  'tfa_enabled',
  'ticket_attachment_upload',
  'ticket_update',
  'token_create',
  'token_delete',
  'token_update',
  'user_ssh_key_add',
  'user_ssh_key_delete',
  'user_ssh_key_update',
  'volume_attach',
  'volume_clone',
  'volume_create',
  'volume_delete',
  'volume_detach',
  'volume_migrate_scheduled',
  'volume_migrate',
  'volume_resize',
  'volume_update',
  'vpc_create',
  'vpc_delete',
  'vpc_update',
];

export const EVENT_STATUSES: Event['status'][] = [
  'scheduled',
  'started',
  'finished',
  'failed',
  'notification',
];
