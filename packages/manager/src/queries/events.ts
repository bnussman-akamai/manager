import React from 'react';
import { EventWithStore } from 'src/events';
import { DateTime } from 'luxon';
import { Event, getEvents, markEventRead } from '@linode/api-v4/lib/account';
import { APIError, Filter, ResourcePage } from '@linode/api-v4/lib/types';
import { INTERVAL, ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { linodeEventsHandler } from './linodes/events';
import { domainEventsHandler } from './domains';
import { volumeEventsHandler } from './volumes';
import {
  InfiniteData,
  QueryClient,
  QueryKey,
  UseQueryOptions,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from 'react-query';

const queryKey = 'events';

export const useEventsPolling = (
  options?: UseQueryOptions<Event[], APIError[]> & { isMainPolling?: boolean }
) => {
  const queryClient = useQueryClient();
  const [intervalMultiplier, setIntervalMultiplier] = React.useState(1);
  const [mountTime] = React.useState(Date.now);

  return useQuery<Event[], APIError[]>(
    [queryKey, 'polling'],
    async () => {
      const events = await getEvents(
        { page_size: 25 },
        // {
        //   read: false,
        //   created: {
        //     '+gte': DateTime.fromMillis(mountTime, {
        //       zone: 'utc',
        //     }).toFormat(ISO_DATETIME_NO_TZ_FORMAT),
        //   },
        // }
        {
          read: false,
          '+or': [
            {
              created: {
                '+gte': DateTime.fromMillis(mountTime, {
                  zone: 'utc',
                }).toFormat(ISO_DATETIME_NO_TZ_FORMAT),
              },
            },
            {
              created: {
                '+lt': DateTime.fromMillis(mountTime, {
                  zone: 'utc',
                }).toFormat(ISO_DATETIME_NO_TZ_FORMAT),
              },
              status: { '+or': ['scheduled, started'] },
            },
          ],
        }
      );
      setIntervalMultiplier(Math.min(intervalMultiplier + 1, 16));
      return events.data;
    },
    {
      refetchInterval: INTERVAL * intervalMultiplier,
      retryDelay: 5000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      ...options,
      onSuccess(inProgressEvents) {
        if (options?.onSuccess) {
          options.onSuccess(inProgressEvents);
        }

        if (options?.isMainPolling) {
          for (const event of inProgressEvents) {
            // Mark event as read if it isn *not* considered "in progress"
            if (!['scheduled', 'started'].includes(event.status)) {
              markEventRead(event.id);
            }

            // Keep other Events queries up to date
            updateEventsCache(queryClient, [queryKey, 'infinite'], event);

            // Call per-entity event handlers
            invokeEventHandlers({ event, queryClient });
          }
        }
      },
    }
  );
};

export const useEventsInfiniteQuery = (filter?: Filter) => {
  return useInfiniteQuery<ResourcePage<Event>, APIError[]>(
    [queryKey, 'infinite'],
    ({ pageParam }) => getEvents({ page: pageParam, page_size: 25 }, filter),
    {
      getNextPageParam: ({ page, pages }) =>
        page < pages ? page + 1 : undefined,
    }
  );
};

const locateEvent = (
  eventsCache: InfiniteData<ResourcePage<Event>>,
  eventId: number
) => {
  for (let pageIdx = 0; pageIdx < eventsCache.pages.length; pageIdx++) {
    const page = eventsCache.pages[pageIdx];
    for (let eventIdx = 0; eventIdx < page.data.length; eventIdx++) {
      if (page.data[eventIdx].id === eventId) {
        return { pageIdx, eventIdx };
      }
    }
  }
  return null;
};

const updateEventsCache = (
  queryClient: QueryClient,
  queryKey: QueryKey,
  event: Event
) => {
  const eventsCache = queryClient.getQueryData<
    InfiniteData<ResourcePage<Event>>
  >(queryKey);

  if (eventsCache) {
    const eventLocation = locateEvent(eventsCache, event.id);
    if (eventLocation) {
      eventsCache.pages[eventLocation.pageIdx].data[
        eventLocation.eventIdx
      ] = event;
      queryClient.setQueryData<InfiniteData<ResourcePage<Event>>>(
        queryKey,
        eventsCache
      );
    } else {
      queryClient.invalidateQueries(queryKey);
    }
  }
};

function invokeEventHandlers({ event, queryClient }: EventWithStore) {
  if (event.action.startsWith('linode')) {
    linodeEventsHandler({ event, queryClient });
  }
  if (event.action.startsWith('domain')) {
    domainEventsHandler({ event, queryClient });
  }
  if (event.action.startsWith('volume')) {
    volumeEventsHandler({ event, queryClient });
  }
}
