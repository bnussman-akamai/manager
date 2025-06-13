import { Stack, Typography } from '@linode/ui';
import { getFormattedStatus } from '@linode/utilities';
import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { isEventRelevantToLinode } from 'src/queries/events/event.helpers';
import { useInProgressEvents } from 'src/queries/events/events';

import {
  LINODE_EVENT_TO_STATUS_MAP,
  LINODE_STATUS_TO_STATUS_ICON,
} from './LinodeStatus.utils';

import type { Linode } from '@linode/api-v4';

export const LinodeStatus = (props: Pick<Linode, 'id' | 'status'>) => {
  const { id, status } = props;

  const { data: events } = useInProgressEvents();

  const event = events?.findLast((event) => isEventRelevantToLinode(event, id));

  if (event && event.percent_complete !== null) {
    return (
      <Stack direction="row" spacing={1}>
        <StatusIcon status="other" />
        <Typography>
          {LINODE_EVENT_TO_STATUS_MAP[event.action]} ({event.percent_complete}%)
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1}>
      <StatusIcon status={LINODE_STATUS_TO_STATUS_ICON[status]} />
      <Typography>{getFormattedStatus(status)}</Typography>
    </Stack>
  );
};
