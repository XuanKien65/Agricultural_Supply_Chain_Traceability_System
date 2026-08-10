import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './auth.store'
import type { Role } from './auth.types'

interface Props {
  roles: Role[]
}

/** Route guard dùng chung cho mọi role — chặn ai không thuộc `roles`. */
export function RoleRoute({ roles }: Props) {
  const user = useAuthStore((state) => state.user)

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
