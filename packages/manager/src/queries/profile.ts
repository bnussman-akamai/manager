import { getQueryKeys } from '@banksnussman/query-key';
import { APIError, Filter, Grants, Params, ResourcePage } from '@linode/api-v4';
import {
  Profile,
  SSHKey,
  SendPhoneVerificationCodePayload,
  TrustedDevice,
  VerifyVerificationCodePayload,
  createSSHKey,
  deleteSSHKey,
  deleteTrustedDevice,
  disableTwoFactor,
  getAppTokens,
  getPersonalAccessTokens,
  getProfile,
  getSSHKeys,
  getSecurityQuestions,
  getTrustedDevices,
  listGrants,
  sendCodeToPhoneNumber,
  smsOptOut,
  updateProfile,
  updateSSHKey,
  verifyPhoneNumberCode,
} from '@linode/api-v4/lib/profile';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { EventWithStore } from 'src/events';

import { accountQueries } from './account';
import { queryPresets } from './base';

export const { profile: profileQueries } = getQueryKeys({
  profile: {
    appTokens: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: getAppTokens,
      queryKey: [params, filter],
    }),
    grants: {
      queryFn: listGrants,
    },
    info: {
      queryFn: getProfile,
    },
    personalAccessTokens: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: getPersonalAccessTokens,
      queryKey: [params, filter],
    }),
    securityQuestions: {
      queryFn: getSecurityQuestions,
    },
    sshKeys: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: getSSHKeys,
      queryKey: [params, filter],
    }),
    trustedDevices: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: getTrustedDevices,
      queryKey: [params, filter],
    }),
  },
});

export const useProfile = (givenProfile?: Profile) =>
  useQuery<Profile, APIError[]>({
    ...profileQueries.info,
    ...queryPresets.oneTimeFetch,
    initialData: givenProfile,
  });

export const useMutateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, APIError[], Partial<Profile>>({
    mutationFn: updateProfile,
    onSuccess: (newData) => updateProfileData(newData, queryClient),
  });
};

export const updateProfileData = (
  newData: Partial<Profile>,
  queryClient: QueryClient
): void => {
  queryClient.setQueryData(
    profileQueries.info.queryKey,
    (oldData: Profile) => ({
      ...oldData,
      ...newData,
    })
  );
};

export const useGrants = () => {
  const { data: profile } = useProfile();

  return useQuery<Grants, APIError[]>({
    ...profileQueries.grants,
    ...queryPresets.oneTimeFetch,
    enabled: Boolean(profile?.restricted),
  });
};

export const getProfileData = (queryClient: QueryClient) =>
  queryClient.getQueryData<Profile>(profileQueries.info.queryKey);

export const getGrantData = (queryClient: QueryClient) =>
  queryClient.getQueryData<Grants>(profileQueries.grants.queryKey);

export const useSMSOptOutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: smsOptOut,
    onSuccess: () => {
      updateProfileData({ verified_phone_number: null }, queryClient);
    },
  });
};

export const useSendPhoneVerificationCodeMutation = () =>
  useMutation<{}, APIError[], SendPhoneVerificationCodePayload>({
    mutationFn: sendCodeToPhoneNumber,
  });

export const useVerifyPhoneVerificationCodeMutation = () =>
  useMutation<{}, APIError[], VerifyVerificationCodePayload>({
    mutationFn: verifyPhoneNumberCode,
  });

export const useSSHKeysQuery = (
  params?: Params,
  filter?: Filter,
  enabled = true
) =>
  useQuery({
    ...profileQueries.sshKeys(params, filter),
    enabled,
    keepPreviousData: true,
  });

export const useCreateSSHKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string; ssh_key: string }>({
    mutationFn: createSSHKey,
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.sshKeys.queryKey);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries(accountQueries.users.paginated.queryKey);
    },
  });
};

export const useUpdateSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string }>({
    mutationFn: (data) => updateSSHKey(id, data),
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.sshKeys.queryKey);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries(accountQueries.users.paginated.queryKey);
    },
  });
};

export const useDeleteSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteSSHKey(id),
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.sshKeys.queryKey);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries(accountQueries.users.paginated.queryKey);
    },
  });
};

export const sshKeyEventHandler = (event: EventWithStore) => {
  // This event handler is a bit agressive and will over-fetch, but UX will
  // be great because this will ensure Cloud has up to date data all the time.

  event.queryClient.invalidateQueries(profileQueries.sshKeys.queryKey);
  // also invalidate the /account/users data because that endpoint returns some SSH key data
  event.queryClient.invalidateQueries(accountQueries.users.paginated.queryKey);
};

export const useTrustedDevicesQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<TrustedDevice>, APIError[]>({
    ...profileQueries.trustedDevices(params, filter),
    keepPreviousData: true,
  });

export const useRevokeTrustedDeviceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteTrustedDevice(id),
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.trustedDevices.queryKey);
    },
  });
};

export const useDisableTwoFactorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: disableTwoFactor,
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.info.queryKey);
    },
  });
};
