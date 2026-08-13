import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import {
  Agriculture,
  FactCheckRounded as ClipboardCheck,
  Factory,
  LocalShipping,
  Storefront,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { useAuthStore } from './auth.store'
import { REGISTERABLE_ROLES, type RegisterableRole } from './auth.types'

const ROLE_ICONS: Record<RegisterableRole, typeof Agriculture> = {
  Farmer: Agriculture,
  Processor: Factory,
  Distributor: LocalShipping,
  Retailer: Storefront,
  Inspector: ClipboardCheck,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register, status, error } = useAuthStore()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<RegisterableRole>('Farmer')
  const [formError, setFormError] = useState<string | null>(null)

  const confirmMismatch = confirmPassword.length > 0 && password !== confirmPassword

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError(t('auth.required', 'Vui lòng điền đầy đủ thông tin'))
      return
    }
    if (!EMAIL_PATTERN.test(email)) {
      setFormError(t('auth.emailInvalid', 'Email không hợp lệ'))
      return
    }
    if (password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (password !== confirmPassword) {
      setFormError(t('auth.passwordMismatch', 'Mật khẩu xác nhận không khớp'))
      return
    }
    setFormError(null)
    try {
      await register({
        fullName,
        email,
        username: username.trim() || email.trim(),
        password,
        role,
      })
      navigate('/', { replace: true })
    } catch {
      /* error surfaced via store */
    }
  }

  const errorMessage = formError ?? error

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 560, p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {t('auth.register')}
        </Typography>
        <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 14 }}>
          {t('auth.createAccountSubtitle')}
        </Typography>

        <Box component="form" onSubmit={onSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('auth.fullName')}
            placeholder={t('auth.fullNamePlaceholder')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('auth.email')}
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('auth.username', 'Tên tài khoản (Tùy chọn, mặc định lấy email)')}
            placeholder="Ví dụ: farmer123"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label={t('auth.confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmMismatch}
              helperText={confirmMismatch ? t('auth.passwordMismatch') : undefined}
              required
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>{t('auth.role')}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
              {REGISTERABLE_ROLES.map((r) => {
                const Icon = ROLE_ICONS[r]
                const active = r === role
                return (
                  <Button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    variant={active ? 'contained' : 'outlined'}
                    color={active ? 'primary' : 'inherit'}
                    sx={{ flexDirection: 'column', gap: 0.5, py: 1, fontSize: 11 }}
                  >
                    <Icon fontSize="small" />
                    {t(`auth.roles.${r}`, r)}
                  </Button>
                )
              })}
            </Box>
          </Box>

          {errorMessage && (
            <Alert severity="error" variant="filled" sx={{ borderRadius: 2, fontSize: 13 }}>
              {errorMessage}
            </Alert>
          )}

          <Button type="submit" variant="contained" loading={status === 'loading'} fullWidth>
            {t('auth.register')}
          </Button>

          <Typography sx={{ textAlign: 'center', fontSize: 14, color: 'text.secondary' }}>
            {t('auth.haveAccount')}{' '}
            <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>
              {t('auth.signIn')}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
