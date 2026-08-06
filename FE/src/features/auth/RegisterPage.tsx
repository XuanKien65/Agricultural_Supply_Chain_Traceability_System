import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Sprout, Factory, Truck, Store, ClipboardCheck } from 'lucide-react'
import { useAuthStore } from './auth.store'
import { REGISTERABLE_ROLES, type RegisterableRole } from './auth.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { clsx } from 'clsx'

const ROLE_ICONS: Record<RegisterableRole, typeof Sprout> = {
  Farmer: Sprout,
  Processor: Factory,
  Distributor: Truck,
  Retailer: Store,
  Inspector: ClipboardCheck,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register, status, error } = useAuthStore()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<RegisterableRole>('Farmer')
  const [unitName, setUnitName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const confirmMismatch = confirmPassword.length > 0 && password !== confirmPassword

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !unitName.trim()
    ) {
      setFormError(t('auth.required'))
      return
    }
    if (!EMAIL_PATTERN.test(email)) {
      setFormError(t('auth.emailInvalid'))
      return
    }
    if (password !== confirmPassword) {
      setFormError(t('auth.passwordMismatch'))
      return
    }
    setFormError(null)
    try {
      await register({ fullName, email, password, role, unitName })
      navigate('/', { replace: true })
    } catch {
      /* error surfaced via store */
    }
  }

  const errorMessage =
    formError ??
    (error === 'emailTaken'
      ? t('auth.emailTaken')
      : error && t('auth.invalidCredentials'))

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6">
        <h1 className="text-xl font-semibold">{t('auth.register')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('auth.createAccountSubtitle')}</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label={t('auth.fullName')}
            placeholder={t('auth.fullNamePlaceholder')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label={t('auth.email')}
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div>
              <Input
                label={t('auth.confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmMismatch ? t('auth.passwordMismatch') : undefined}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('auth.role')}
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {REGISTERABLE_ROLES.map((r) => {
                const Icon = ROLE_ICONS[r]
                const active = r === role
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={clsx(
                      'flex flex-col items-center gap-1 rounded-lg border p-2 text-center text-xs transition-colors',
                      active
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
                    )}
                  >
                    <Icon size={20} />
                    {t(`auth.roles.${r}`)}
                  </button>
                )
              })}
            </div>
          </div>

          <Input
            label={t('auth.unitName')}
            placeholder={t('auth.unitNamePlaceholder')}
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            required
          />

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <Button type="submit" loading={status === 'loading'}>
            {t('auth.register')}
          </Button>

          <p className="text-center text-sm text-gray-500">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              {t('auth.signIn')}
            </Link>
          </p>
        </form>
      </Card>
    </div>
  )
}
