import { APIError, Notification } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './account';

export const useNotificationsQuery = () =>
  useQuery<Notification[], APIError[]>(accountQueries.notifications);
