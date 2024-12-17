import { BETA_API_ROOT as API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';
import {
  AvailableMetrics,
  JWEToken,
  JWETokenPayLoad,
  ServiceTypesList,
} from './types';
import { ResourcePage as Page } from '../types';

export const getMetricDefinitionsByServiceType = (serviceType: string) => {
  return Request<Page<AvailableMetrics>>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType
      )}/metric-definitions`
    ),
    setMethod('GET')
  );
};

export const getJWEToken = (data: JWETokenPayLoad, serviceType: string) =>
  Request<JWEToken>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(serviceType)}/token`
    ),
    setMethod('POST'),
    setData(data)
  );

// Returns the list of service types available
export const getCloudPulseServiceTypes = () =>
  Request<ServiceTypesList>(
    setURL(`${API_ROOT}/monitor/services`),
    setMethod('GET')
  );
