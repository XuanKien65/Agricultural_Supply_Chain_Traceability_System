import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  managementApi,
} from './management.api'

export function useOrganizations(
  params?: Parameters<
    typeof managementApi.getOrganizations
  >[0],
) {
  return useQuery({
    queryKey: [
      'organizations',
      params,
    ],

    queryFn: () =>
      managementApi.getOrganizations(
        params ?? {},
      ),
  })
}

export function useUsers(
  params?: Parameters<
    typeof managementApi.getUsers
  >[0],
) {
  return useQuery({
    queryKey: [
      'users',
      params,
    ],

    queryFn: () =>
      managementApi.getUsers(
        params ?? {},
      ),
  })
}

export function useProducts(
  params?: Parameters<
    typeof managementApi.getProducts
  >[0],
) {
  return useQuery({
    queryKey: [
      'products',
      params,
    ],

    queryFn: () =>
      managementApi.getProducts(
        params ?? {},
      ),
  })
}

export function useManagementMutation<
  TVariables,
  TResult,
>(
  mutationFn: (
    variables: TVariables,
  ) => Promise<TResult>,

  invalidateKeys: string[],
) {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn,

    onSuccess: async () => {
      await Promise.all(
        invalidateKeys.map(
          (key) =>
            queryClient
              .invalidateQueries({
                queryKey: [
                  key,
                ],
              }),
        ),
      )
    },
  })
}