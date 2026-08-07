import {
  Navigate,
  Outlet,
} from 'react-router-dom'

import { useAuthStore } from '@/features/auth/auth.store'

export function AdminRoute() {
  const user = useAuthStore(
    (state) => state.user,
  )

  if (user?.role !== 'Admin') {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return <Outlet />
}