import {
  getProfile,
  listGrants,
  Profile,
  smsOptOut,
  sendCodeToPhoneNumber,
  SendPhoneVerificationCodePayload,
  updateProfile,
  verifyPhoneNumberCode,
  VerifyVerificationCodePayload,
  getAppTokens,
  Token,
  getPersonalAccessTokens,
} from '@linode/api-v4/lib/profile';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { Grants } from '../../../api-v4/lib';
import { queryClient, queryPresets } from './base';

export const queryKey = 'profile';

export const useProfile = (givenProfile?: Profile) =>
  useQuery<Profile, APIError[]>(queryKey, getProfile, {
    ...queryPresets.oneTimeFetch,
    initialData: givenProfile,
  });

export const useAppTokensQuery = (params?: any, filter?: any) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    queryKey: [queryKey, 'apps', params, filter],
    queryFn: () => getAppTokens(params, filter),
  });
};

export const usePersonalAccessTokensQuery = (params?: any, filter?: any) => {
  return useQuery<ResourcePage<Token>, APIError[]>({
    queryKey: [queryKey, 'personal-access-tokens', params, filter],
    queryFn: () => getPersonalAccessTokens(params, filter),
  });
};

export const useMutateProfile = () => {
  return useMutation<Profile, APIError[], Partial<Profile>>(
    (data) => {
      return updateProfile(data);
    },
    { onSuccess: updateProfileData }
  );
};

export const updateProfileData = (newData: Partial<Profile>): void => {
  queryClient.setQueryData(queryKey, (oldData: Profile) => ({
    ...oldData,
    ...newData,
  }));
};

export const useGrants = () =>
  useQuery<Grants, APIError[]>(
    `${queryKey}-grants`,
    listGrants,
    queryPresets.oneTimeFetch
  );

export const getProfileData = () => queryClient.getQueryData<Profile>(queryKey);
export const getGrantData = () =>
  queryClient.getQueryData<Grants>(`${queryKey}-grants`);

export const useSMSOptOutMutation = () =>
  useMutation<{}, APIError[]>(smsOptOut, {
    onSuccess: () => {
      updateProfileData({ verified_phone_number: null });
    },
  });

export const useSendPhoneVerificationCodeMutation = () =>
  useMutation<{}, APIError[], SendPhoneVerificationCodePayload>(
    sendCodeToPhoneNumber
  );

export const useVerifyPhoneVerificationCodeMutation = () =>
  useMutation<{}, APIError[], VerifyVerificationCodePayload>(
    verifyPhoneNumberCode
  );
