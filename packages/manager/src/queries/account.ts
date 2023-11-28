import { getQueryKeys } from '@banksnussman/query-key';
import {
  Account,
  AccountAvailability,
  AccountMaintenance,
  Invoice,
  Payment,
  getAccountAgreements,
  getAccountAvailabilities,
  getAccountAvailability,
  getAccountBeta,
  getAccountBetas,
  getAccountInfo,
  getAccountLogins,
  getAccountMaintenance,
  getAccountSettings,
  getInvoices,
  getNotifications,
  getPayments,
  Notification,
  updateAccountInfo,
  getOAuthClients,
  PaymentMethod,
  getPaymentMethods,
  getClientToken,
  getNetworkUtilization,
  getUsers,
  getUser,
} from '@linode/api-v4/lib/account';
import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useProfile } from 'src/queries/profile';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

const getAllAccountAvailabilitiesRequest = () =>
  getAll<AccountAvailability>((params, filters) =>
    getAccountAvailabilities(params, filters)
  )().then((data) => data.data);

const getAllAccountInvoices = async (
  passedParams: Params = {},
  passedFilter: Filter = {}
) => {
  const res = await getAll<Invoice>((params, filter) =>
    getInvoices({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )();
  return res.data;
};

const getAllAccountPayments = async (
  passedParams: Params = {},
  passedFilter: Filter = {}
) => {
  const res = await getAll<Payment>((params, filter) =>
    getPayments({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )();
  return res.data;
};

const getAllAccountMaintenance = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<AccountMaintenance>((params, filter) =>
    getAccountMaintenance(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((res) => res.data);

export const getAllNotifications = () =>
  getAll<Notification>(getNotifications)().then((data) => data.data);

  
/**
 * This getAll is probably overkill for getting all paginated payment
 * methods, but for now, use it to be safe.
 */
export const getAllPaymentMethodsRequest = () =>
  getAll<PaymentMethod>((params) => getPaymentMethods(params))().then(
    (data) => data.data
  );


export const { account: accountQueries } = getQueryKeys({
  account: {
    account: {
      queryFn: getAccountInfo,
    },
    agreements: {
      queryFn: getAccountAgreements,
    },
    availabilites: {
      all: {
        queryFn: getAllAccountAvailabilitiesRequest,
      },
      availability: (regionId: string) => ({
        queryFn: () => getAccountAvailability(regionId),
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAccountAvailabilities(params, filter),
      }),
    },
    betas: {
      beta: (id: string) => ({
        queryFn: () => getAccountBeta(id),
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAccountBetas(params, filter),
      }),
    },
    clientToken: {
      queryFn: getClientToken,
    },
    invoices: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllAccountInvoices(params, filter),
      }),
    },
    logins: {
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAccountLogins(params, filter),
      }),
    },
    maintenance: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllAccountMaintenance(params, filter),
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAccountMaintenance(params, filter),
      }),
    },
    notifications: {
      queryFn: getAllNotifications,
    },
    oauthClients: {
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getOAuthClients(params, filter)
      }),
    },
    paymentMethods: {
      all: {
        queryFn: getAllPaymentMethodsRequest,
      },
      paginated: (params: Params = {}) => ({
        queryFn: () => getPaymentMethods(params),
      }),
    },
    payments: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllAccountPayments(params, filter),
      }),
    },
    settings: {
      queryFn: getAccountSettings,
    },
    transfer: {
      queryFn: getNetworkUtilization,
    },
    users: {
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getUsers(params, filter),
      }),
      user: (username: string) => ({
        queryFn: () => getUser(username),
      }),
    },
  },
});

export const useAccount = () => {
  const { data: profile } = useProfile();

  return useQuery<Account, APIError[]>({
    ...accountQueries.account,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

export const useMutateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<Account, APIError[], Partial<Account>>(updateAccountInfo, {
    onSuccess(account) {
      queryClient.setQueryData(accountQueries.account.queryKey, account);
    },
  });
};
