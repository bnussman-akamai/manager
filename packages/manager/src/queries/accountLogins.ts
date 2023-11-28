import { AccountLogin } from '@linode/api-v4/lib/account';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './account';

export const queryKey = 'account-login';

export const useAccountLoginsQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<AccountLogin>, APIError[]>({
    ...accountQueries.logins.paginated(params, filter),
    keepPreviousData: true,
  });
