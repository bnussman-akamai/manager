import { API_ROOT } from '../constants';
import Request, { setMethod, setURL, setParams } from '../request';
import { Params, PriceType, ResourcePage } from '../types';

export const getNetworkTransferPrices = (params?: Params) =>
  Request<ResourcePage<PriceType>>(
    setURL(`${API_ROOT}/network-transfer/prices`),
    setMethod('GET'),
    setParams(params)
  );
