import { ClientToken, PaymentMethod } from '@linode/api-v4/lib/account';
import { APIError, Params, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { useGrants } from 'src/queries/profile';

import { accountQueries } from './account';
import { queryPresets } from './base';

export const queryKey = 'account-payment-methods';

export const usePaymentMethodsQuery = (params: Params = {}) => {
  return useQuery<ResourcePage<PaymentMethod>, APIError[]>({
    ...accountQueries.paymentMethods.paginated(params),
    ...queryPresets.oneTimeFetch,
  });
};

export const useAllPaymentMethodsQuery = () => {
  const { data: grants } = useGrants();

  return useQuery<PaymentMethod[], APIError[]>({
    ...accountQueries.paymentMethods.all,
    ...queryPresets.oneTimeFetch,
    enabled: grants?.global?.account_access !== null,
  });
};

export const useClientToken = () =>
  useQuery<ClientToken, APIError[]>({
    ...accountQueries.clientToken,
    ...queryPresets.longLived,
  });
