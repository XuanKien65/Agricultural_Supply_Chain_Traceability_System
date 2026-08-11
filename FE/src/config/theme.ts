import { createTheme } from '@mui/material/styles'

/**
 * Bảng màu thương hiệu — gom từ các mã hex đang rải rác trong Admin
 * (sidebar #123D24, primary #19713A, primary-light #E8F5E9...).
 */
export const theme = createTheme({
  palette: {
    primary: {
      main: '#19713A',
      dark: '#123D24',
      light: '#E8F5E9',
      contrastText: '#ffffff',
    },
    error: { main: '#C62828' },
    warning: { main: '#E65100' },
    background: { default: '#F4F7F5' },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
  },
})
