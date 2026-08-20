export interface ApiEnvelope<T> {
  success?: boolean
  isSuccess?: boolean

  data?: T
  result?: T

  message?: string

  errors?:
    | Array<{
        field?: string
        code?: string
        message?: string
      }>
    | null

  timestamp?: string
}

export interface PagedResult<T> {
  items: T[]

  totalCount: number

  page: number

  pageSize: number

  totalPages: number
}

export function unwrapApi<T>(
  response: ApiEnvelope<T>,
): T {
  const data =
    response.data ??
    response.result

  if (data === undefined) {
    throw new Error(
      response.message ??
        'API không trả về dữ liệu.',
    )
  }

  return data
}