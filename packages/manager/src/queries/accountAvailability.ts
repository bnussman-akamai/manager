import {
  AccountAvailability,
  getAccountAvailability,
} from '@linode/api-v4/lib/account';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './account';

export const useAccountAvailabilitiesQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = true
) => {
  return useQuery<ResourcePage<AccountAvailability>, APIError[]>({
    ...accountQueries.availabilites.paginated(params, filter),
    enabled,
    keepPreviousData: true,
  });
};

export const useAccountAvailabilitiesQueryUnpaginated = (
  enabled: boolean = true
) =>
  useQuery<AccountAvailability[], APIError[]>({
    ...accountQueries.availabilites.all,
    enabled,
    keepPreviousData: true,
  });

export const useAccountAvailabilityQuery = (
  id: string,
  enabled: boolean = true
) => {
  return useQuery<AccountAvailability, APIError[]>({
    ...accountQueries.availabilites.availability(id),
    enabled,
  });
};
