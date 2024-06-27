import {
  createBucket,
  deleteBucket,
  deleteSSLCert,
  getBuckets,
  getClusters,
  getObjectList,
  getObjectStorageKeys,
  getObjectStorageTypes,
  getObjectURL,
  getSSLCert,
  uploadSSLCert,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { OBJECT_STORAGE_DELIMITER as delimiter } from 'src/constants';
import { getAll } from 'src/utilities/getAll';

import { accountQueries } from './account/queries';
import { queryPresets } from './base';

import type {
  ObjectStorageBucket,
  ObjectStorageBucketRequestPayload,
  ObjectStorageBucketSSLRequest,
  ObjectStorageBucketSSLResponse,
  ObjectStorageCluster,
  ObjectStorageDeleteBucketRequestPayload,
  ObjectStorageKey,
  ObjectStorageObjectListResponse,
  ObjectStorageObjectURL,
  ObjectStorageObjectURLOptions,
} from '@linode/api-v4';
import type {
  APIError,
  Params,
  PriceType,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import type { UseQueryOptions } from '@tanstack/react-query';

export const getAllObjectStorageClusters = () =>
  getAll<ObjectStorageCluster>(() => getClusters())().then((data) => data.data);

export const getAllObjectStorageBuckets = () =>
  getAll<ObjectStorageBucket>(() => getBuckets())().then((data) => data.data);

const getAllObjectStorageTypes = () =>
  getAll<PriceType>((params) => getObjectStorageTypes(params))().then(
    (data) => data.data
  );

export const objectStorageQueries = createQueryKeys('object-storage', {
  accessKeys: (params: Params) => ({
    queryFn: () => getObjectStorageKeys(params),
    queryKey: [params],
  }),
  bucket: (region: string, bucket: string) => ({
    contextQueries: {
      ssl: {
        queryFn: () => getSSLCert(region, bucket),
        queryKey: null,
      },
    },
    queryKey: [region, bucket],
  }),
  buckets: {
    queryFn: getAllObjectStorageBuckets,
    queryKey: null,
  },
  clusters: {
    queryFn: getAllObjectStorageClusters,
    queryKey: null,
  },
  types: {
    queryFn: getAllObjectStorageTypes,
    queryKey: null,
  },
});

export const useObjectStorageBuckets = (
  options?: UseQueryOptions<ObjectStorageBucket[], APIError[]>
) =>
  useQuery<ObjectStorageBucket[], APIError[]>({
    ...objectStorageQueries.buckets,
    ...options,
  });

export const useObjectStorageClusters = (enabled = true) =>
  useQuery<ObjectStorageCluster[], APIError[]>({
    ...objectStorageQueries.clusters,
    enabled,
  });

export const useObjectStorageAccessKeys = (params: Params) =>
  useQuery<ResourcePage<ObjectStorageKey>, APIError[]>({
    ...objectStorageQueries.accessKeys(params),
    keepPreviousData: true,
  });

export const useCreateBucketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ObjectStorageBucket,
    APIError[],
    ObjectStorageBucketRequestPayload
  >({
    mutationFn: createBucket,
    onSuccess(bucket) {
      // Add the new bucket to the "all buckets store"
      queryClient.setQueryData<ObjectStorageBucket[]>(
        objectStorageQueries.buckets.queryKey,
        (buckets) => {
          if (!buckets) {
            return [bucket];
          }
          return [...buckets, bucket];
        }
      );

      // Invalidate account settings because it contains obj information
      queryClient.invalidateQueries(accountQueries.settings.queryKey);
    },
  });
};

export const useDeleteBucketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], ObjectStorageDeleteBucketRequestPayload>({
    mutationFn: deleteBucket,
    onSuccess: (data, variables) => {
      queryClient.setQueryData<ObjectStorageBucket[]>(
        objectStorageQueries.buckets.queryKey,
        (buckets) =>
          buckets?.filter(
            (b) =>
              !(b.region === variables.region && b.label === variables.label)
          )
      );
    },
  });
};

export const useObjectBucketDetailsInfiniteQuery = (
  region: string,
  bucket: string,
  prefix: string
) =>
  useInfiniteQuery<ObjectStorageObjectListResponse, APIError[]>({
    getNextPageParam: (lastPage) => lastPage.next_marker,
    queryFn: ({ pageParam }) =>
      getObjectList(region, bucket, { delimiter, marker: pageParam, prefix }),
    queryKey: [
      'object-storage',
      'bucket',
      region,
      bucket,
      'objects',
      ...prefixToQueryKey(prefix),
    ],
  });

/**
 * Used to make a nice React Query queryKey by splitting the prefix
 * by the '/' character.
 *
 * By spreading the result, you can achieve a queryKey that is in the form of:
 * ["object-storage","us-southeast-1","test","testfolder"]
 *
 * @param {string} prefix The Object Stoage prefix path
 * @returns {string[]} a list of paths
 */
export const prefixToQueryKey = (prefix: string) => {
  return prefix.split('/', prefix.split('/').length - 1);
};

export const useCreateObjectUrlMutation = (
  clusterId: string,
  bucketName: string
) =>
  useMutation<
    ObjectStorageObjectURL,
    APIError[],
    {
      method: 'DELETE' | 'GET' | 'POST' | 'PUT';
      name: string;
      options?: ObjectStorageObjectURLOptions;
    }
  >({
    mutationFn: ({ method, name, options }) =>
      getObjectURL(clusterId, bucketName, name, method, options),
  });

export const useBucketSSLQuery = (regionId: string, bucket: string) =>
  useQuery(objectStorageQueries.bucket(regionId, bucket)._ctx.ssl);

export const useBucketSSLMutation = (region: string, bucket: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ObjectStorageBucketSSLResponse,
    APIError[],
    ObjectStorageBucketSSLRequest
  >({
    mutationFn: (data) => uploadSSLCert(region, bucket, data),
    onSuccess(data) {
      queryClient.setQueryData<ObjectStorageBucketSSLResponse>(
        objectStorageQueries.bucket(region, bucket)._ctx.ssl.queryKey,
        data
      );
    },
  });
};

export const useBucketSSLDeleteMutation = (region: string, bucket: string) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteSSLCert(region, bucket),
    onSuccess() {
      queryClient.setQueryData<ObjectStorageBucketSSLResponse>(
        objectStorageQueries.bucket(region, bucket)._ctx.ssl.queryKey,
        { ssl: false }
      );
    },
  });
};

export const useObjectStorageTypesQuery = (enabled = true) =>
  useQuery<PriceType[], APIError[]>({
    ...objectStorageQueries.types,
    ...queryPresets.oneTimeFetch,
    enabled,
  });
