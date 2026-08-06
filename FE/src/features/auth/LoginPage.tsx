import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from './auth.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, status, error } = useAuthStore()

  const [email, setEmail] = useState('admin@gmail.com')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)

  const redirectTo = (location.state as LocationState)?.from?.pathname ?? '/'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch {
      /* error surfaced via store */
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-xl font-semibold">{t('auth.login')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('auth.signInToContinue')}</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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
          {error && (
            <p className="text-sm text-red-600">{t('auth.invalidCredentials')}</p>
          )}
          <Button type="submit" loading={status === 'loading'}>
            {t('auth.login')}
          </Button>
          <p className="text-center text-xs text-gray-400">admin@gmail.com / 123456</p>
          <p className="text-center text-sm text-gray-500">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              {t('auth.signUp')}
            </Link>
          </p>
        </form>
      </Card>
    </div>
  )
}
