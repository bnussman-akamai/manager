import { Invoice, Payment } from '@linode/api-v4/lib/account';
import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './account';
import { queryPresets } from './base';

export const queryKey = 'account-billing';

export const useAllAccountInvoices = (
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<Invoice[], APIError[]>({
    ...accountQueries.invoices.all(params, filter),
    ...queryPresets.oneTimeFetch,
    keepPreviousData: true,
  });
};

export const useAllAccountPayments = (
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<Payment[], APIError[]>({
    ...accountQueries.payments.all(params, filter),
    ...queryPresets.oneTimeFetch,
    keepPreviousData: true,
  });
};
