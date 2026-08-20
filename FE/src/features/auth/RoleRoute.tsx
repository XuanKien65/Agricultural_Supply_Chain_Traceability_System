import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './auth.store'
import { ROLE_DEFAULT_ROUTES, type Role } from './auth.types'

interface Props {
  roles: Role[]
}

/** Route guard dùng chung cho mọi role — chặn ai không thuộc `roles`, đưa về trang mặc định của vai trò đó. */
export function RoleRoute({ roles }: Props) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={ROLE_DEFAULT_ROUTES[user.role]} replace />
  }

  return <Outlet />
}
