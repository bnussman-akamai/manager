import { RegionalNetworkUtilization } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './account';
import { queryPresets } from './base';

export const useAccountTransfer = () =>
  useQuery<RegionalNetworkUtilization, APIError[]>({
    ...accountQueries.transfer,
    ...queryPresets.oneTimeFetch,
  });
