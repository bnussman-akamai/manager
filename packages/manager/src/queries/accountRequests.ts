import {
  getAccountAvailabilities,
  getAccountMaintenance,
  getInvoices,
  getNotifications,
  getPaymentMethods,
  getPayments,
} from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type {
  AccountAvailability,
  AccountMaintenance,
  Filter,
  Invoice,
  Notification,
  Params,
  Payment,
  PaymentMethod,
} from '@linode/api-v4';

export const getAllAccountAvailabilitiesRequest = () =>
  getAll<AccountAvailability>((params, filters) =>
    getAccountAvailabilities(params, filters)
  )().then((data) => data.data);

export const getAllAccountInvoices = async (
  passedParams: Params = {},
  passedFilter: Filter = {}
) => {
  const res = await getAll<Invoice>((params, filter) =>
    getInvoices({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )();
  return res.data;
};

export const getAllAccountPayments = async (
  passedParams: Params = {},
  passedFilter: Filter = {}
) => {
  const res = await getAll<Payment>((params, filter) =>
    getPayments({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )();
  return res.data;
};

export const getAllAccountMaintenance = (
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
