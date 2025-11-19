import { getFormattedStatus } from '@linode/utilities';

import {
  isEventRelevantToLinode,
  isInProgressEvent,
  isPrimaryEntity,
  isSecondaryEntity,
} from 'src/queries/events/event.helpers';
import { useInProgressEvents } from 'src/queries/events/events';

import type { Event, EventAction, Linode, LinodeStatus } from '@linode/api-v4';

const transitionActionMap: Partial<Record<EventAction, string>> = {
  backups_restore: 'Backups Restore',
  disk_duplicate: 'Disk Duplicating',
  disk_imagize: 'Capturing Image',
  disk_resize: 'Disk Resizing',
  linode_clone: 'Cloning',
  linode_migrate_datacenter: 'Migrating',
  linode_mutate: 'Upgrading',
  linode_rebuild: 'Rebuilding',
  linode_resize: 'Resizing',
  linode_snapshot: 'Snapshot',
};

export const getLinodeStatus = (
  status: LinodeStatus,
  linodeId: number,
  recentEvent?: Event
): string => {
  if (recentEvent?.action === 'linode_clone') {
    if (isPrimaryEntity(recentEvent, linodeId)) {
      return 'Cloning';
    }
    if (isSecondaryEntity(recentEvent, linodeId)) {
      return 'Creating';
    }
  }

  if (
    recentEvent &&
    !eventsWithSecondaryStatus.includes(recentEvent.action) &&
    transitionActionMap[recentEvent.action]
  ) {
    return transitionActionMap[recentEvent.action]!;
  }

  return getFormattedStatus(status);
};

export const getLinodeSecondaryStatus = (
  linodeId: number,
  recentEvent?: Event
): null | string => {
  if (recentEvent?.action === 'linode_clone') {
    if (isPrimaryEntity(recentEvent, linodeId)) {
      return 'Cloning';
    }
    if (isSecondaryEntity(recentEvent, linodeId)) {
      return 'Creating';
    }
  }

  if (
    recentEvent &&
    eventsWithSecondaryStatus.includes(recentEvent.action) &&
    transitionActionMap[recentEvent.action]
  ) {
    return transitionActionMap[recentEvent.action]!;
  }

  return null;
};

export function useLinodeStatus(linode: Pick<Linode, 'id' | 'status'>) {
  const { data: events } = useInProgressEvents();

  const inProgressEvent = events
    ?.filter(isInProgressEvent)
    .findLast(
      (event) =>
        event.entity &&
        event.entity.type === 'linode' &&
        event.entity.id === linode.id
    );

  const status = getLinodeStatus(linode.status, linode.id, inProgressEvent);
  const secondaryStatus = getLinodeSecondaryStatus(linode.id, inProgressEvent);

  return { status, inProgressEvent, secondaryStatus };
}

// Given a list of Events, returns a set of all Linode IDs that are involved in an in-progress event.
export const linodesInTransition = (events: Event[]) => {
  const set = new Set<number>();

  events.forEach((thisEvent) => {
    const { entity, secondary_entity } = thisEvent;
    if (isInProgressEvent(thisEvent)) {
      if (entity?.type === 'linode') {
        set.add(entity.id);
      } else if (secondary_entity?.type === 'linode') {
        set.add(secondary_entity.id);
      }
    }
  });

  return set;
};

// Linodes have a literal "status" given by the API (linode.status). There are
// states the Linode can be in which aren't entirely communicated with the
// status field, however. Example: Linode A can be cloning to another Linode,
// but have an unrelated status like "running" or "offline". These states can be
// determined by events with the following actions.
const eventsWithSecondaryStatus: EventAction[] = [
  'disk_duplicate',
  'disk_resize',
  'disk_imagize',
  'linode_clone',
  'linode_snapshot',
  'linode_migrate',
  'linode_migrate_datacenter',
  'linode_mutate',
  'linode_rebuild',
];

export const isEventWithSecondaryLinodeStatus = (
  event: Event,
  linodeId: number
) => {
  return (
    isEventRelevantToLinode(event, linodeId) &&
    eventsWithSecondaryStatus.includes(event.action)
  );
};
