import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Alert, Box, Button, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import { ArrowBackRounded, Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuthStore } from './auth.store'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, status, error } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await login({ email, password })
      const currentUser = useAuthStore.getState().user
      const fromPath = (location.state as LocationState)?.from?.pathname

      let target = ''
      if (currentUser?.role === 'ORGADMIN') {
        target = '/admin/organization'
      } else if (currentUser?.role === 'ADMIN') {
        target = '/admin'
      } else if (currentUser?.role === 'FARMER') {
        target = '/farmer'
      } else if (currentUser?.role === 'OPERATOR' || currentUser?.role === 'INSPECTOR') {
        target = '/dashboard'
      } else {
        target = fromPath && fromPath !== '/' && fromPath !== '/login' ? fromPath : '/dashboard'
      }

      navigate(target, { replace: true })
    } catch {
      /* error surfaced via store */
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, position: 'relative' }}>
        <Button
          startIcon={<ArrowBackRounded fontSize="small" />}
          onClick={() => navigate('/')}
          sx={{ mb: 2, color: 'text.secondary', textTransform: 'none', fontWeight: 700, fontSize: 13, p: 0 }}
        >
          Trang chủ
        </Button>

        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          {t('auth.login')}
        </Typography>
        <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 14 }}>
          {t('auth.signInToContinue')}
        </Typography>

        <Box component="form" onSubmit={onSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('auth.email', 'Email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {error && (
            <Alert severity="error" variant="filled" sx={{ borderRadius: 2, fontSize: 13 }}>
              {error}
            </Alert>
          )}

          <Button type="submit" variant="contained" loading={status === 'loading'} fullWidth>
            {t('auth.login')}
          </Button>



          <Typography sx={{ textAlign: 'center', fontSize: 14, color: 'text.secondary' }}>
            {t('auth.noAccount')}{' '}
            <Link to="/register" style={{ color: 'inherit', fontWeight: 600 }}>
              {t('auth.signUp')}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
