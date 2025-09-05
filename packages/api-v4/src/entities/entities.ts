import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL } from '../request';

import type { Params, ResourcePage } from '../types';
import type { AccountEntity } from './types';

/**
 * getAccountEntities
 *
 * Return all entities for account.
 *
 */
export const getAccountEntities = (params?: Params) => {
  return Request<ResourcePage<AccountEntity>>(
    setURL(`${BETA_API_ROOT}/entities`),
    setMethod('GET'),
    setParams(params),
  );
};
