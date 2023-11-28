import { AccountMaintenance } from '@linode/api-v4/lib/account';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './account';
import { queryPresets } from './base';

export const queryKey = 'account-maintenance';

export const useAllAccountMaintenanceQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<AccountMaintenance[], APIError[]>({
    ...accountQueries.maintenance.all(params, filter),
    ...queryPresets.longLived,
    enabled,
  });
};

export const useAccountMaintenanceQuery = (params: Params, filter: Filter) => {
  return useQuery<ResourcePage<AccountMaintenance>, APIError[]>({
    ...accountQueries.maintenance.paginated(params, filter),
    keepPreviousData: true,
    refetchInterval: 20000,
    refetchOnWindowFocus: 'always',
  });
};
