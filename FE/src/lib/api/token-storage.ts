const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export const tokenStorage = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  set(
    accessToken: string,
    refreshToken?: string | null,
  ) {
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken,
    )

    if (refreshToken) {
      localStorage.setItem(
        REFRESH_TOKEN_KEY,
        refreshToken,
      )
    }
  },

  clear() {
    localStorage.removeItem(
      ACCESS_TOKEN_KEY,
    )

    localStorage.removeItem(
      REFRESH_TOKEN_KEY,
    )
  },
}