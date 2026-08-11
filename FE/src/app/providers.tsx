import { StrictMode, Suspense, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { queryClient } from './query-client'
import i18n from '@/lib/i18n'
import { theme } from '@/config/theme'
import { PageLoader } from '@/components/ui/PageLoader'

/** Wraps the app with every cross-cutting provider in one place. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <Suspense fallback={<PageLoader />}>{children}</Suspense>
          </QueryClientProvider>
        </I18nextProvider>
      </ThemeProvider>
    </StrictMode>
  )
}
