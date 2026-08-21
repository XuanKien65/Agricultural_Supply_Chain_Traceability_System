export const env = {
  appName:
    import.meta.env.VITE_APP_NAME ??
    'AgriTrace',

  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ??
    'https://localhost:7191/api',

  apiOrigin:
    import.meta.env.VITE_API_ORIGIN ??
    'https://localhost:7191',

  defaultLocale:
    import.meta.env.VITE_DEFAULT_LOCALE ??
    'vi',

  enableMock:
    import.meta.env.VITE_ENABLE_MOCK === 'true',

  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

export type AppEnv = typeof env