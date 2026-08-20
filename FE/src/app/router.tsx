import {
  Navigate,
  Outlet,
  createBrowserRouter,
} from 'react-router-dom'

import {
  useAuthStore,
} from '@/features/auth/auth.store'

import type {
  UserRole,
} from '@/features/auth/auth.types'

import LoginPage
  from '@/features/auth/LoginPage'

import AccountPage
  from '@/features/auth/AccountPage'

import AdminLayout
  from '@/features/admin/components/AdminLayout'

import ManagementDashboardPage
  from '@/features/management/pages/ManagementDashboardPage'

import OrganizationsPage
  from '@/features/management/pages/OrganizationsPage'

import UsersPage
  from '@/features/management/pages/UsersPage'

import ProductsManagementPage
  from '@/features/management/pages/ProductsManagementPage'

import LookupsPage
  from '@/features/management/pages/LookupsPage'

function AuthGuard() {
  const isAuthenticated =
    useAuthStore(
      (state) =>
        state.isAuthenticated,
    )

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <Outlet />
}

function RoleGuard({
  roles,
}: {
  roles: UserRole[]
}) {
  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    !roles.includes(
      user.role,
    )
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return <Outlet />
}

function HomeRedirect() {
  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  if (
    user?.role === 'ADMIN' ||
    user?.role === 'ORGADMIN'
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  return (
    <Navigate
      to="/account"
      replace
    />
  )
}

export const router =
  createBrowserRouter([
    {
      path: '/login',

      element:
        <LoginPage />,
    },

    {
      element:
        <AuthGuard />,

      children: [
        {
          path: '/',

          element:
            <HomeRedirect />,
        },

        {
          path:
            '/account',

          element:
            <AccountPage />,
        },

        {
          element: (
            <RoleGuard
              roles={[
                'ADMIN',
                'ORGADMIN',
              ]}
            />
          ),

          children: [
            {
              path:
                '/admin',

              element:
                <AdminLayout />,

              children: [
                {
                  index: true,

                  element:
                    <ManagementDashboardPage />,
                },

                {
                  path:
                    'users',

                  element:
                    <UsersPage />,
                },

                {
                  path:
                    'products',

                  element:
                    <ProductsManagementPage />,
                },

                {
                  path:
                    'lookups',

                  element:
                    <LookupsPage />,
                },

                {
                  path:
                    'account',

                  element:
                    <AccountPage />,
                },

                {
                  element: (
                    <RoleGuard
                      roles={[
                        'ADMIN',
                      ]}
                    />
                  ),

                  children: [
                    {
                      path:
                        'organizations',

                      element:
                        <OrganizationsPage />,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    {
      path: '*',

      element: (
        <Navigate
          to="/"
          replace
        />
      ),
    },
  ])