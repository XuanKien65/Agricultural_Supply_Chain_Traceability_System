import { lazy } from 'react'

import {
  createBrowserRouter,
} from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'

import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

import { AdminRoute } from '@/features/admin/AdminRoute'

import { AdminLayout } from '@/features/admin/components/AdminLayout'

import { NotFoundPage } from '@/pages/NotFoundPage'

// ========================
// CODE CŨ CỦA BASE
// ========================

const HomePage = lazy(() =>
  import('@/pages/HomePage').then(
    (m) => ({
      default: m.HomePage,
    }),
  ),
)

const UsersListPage = lazy(() =>
  import(
    '@/features/users/UsersListPage'
  ).then((m) => ({
    default: m.UsersListPage,
  })),
)

const LoginPage = lazy(() =>
  import(
    '@/features/auth/LoginPage'
  ).then((m) => ({
    default: m.LoginPage,
  })),
)

const RegisterPage = lazy(() =>
  import(
    '@/features/auth/RegisterPage'
  ).then((m) => ({
    default: m.RegisterPage,
  })),
)

// ========================
// ADMIN MỚI
// ========================

const AdminDashboardPage =
  lazy(() =>
    import(
      '@/features/admin/pages/AdminDashboardPage'
    ).then((m) => ({
      default:
        m.AdminDashboardPage,
    })),
  )

const AdminRolesPage =
  lazy(() =>
    import(
      '@/features/admin/pages/AdminRolesPage'
    ).then((m) => ({
      default:
        m.AdminRolesPage,
    })),
  )

const AdminUnitsPage =
  lazy(() =>
    import(
      '@/features/admin/pages/AdminUnitsPage'
    ).then((m) => ({
      default:
        m.AdminUnitsPage,
    })),
  )

const AdminUsersPage =
  lazy(() =>
    import(
      '@/features/admin/pages/AdminUsersPage'
    ).then((m) => ({
      default:
        m.AdminUsersPage,
    })),
  )

const AdminProductsPage =
  lazy(() =>
    import(
      '@/features/admin/pages/AdminProductsPage'
    ).then((m) => ({
      default:
        m.AdminProductsPage,
    })),
  )

const AdminBatchesPage =
  lazy(() =>
    import(
      '@/features/admin/pages/AdminBatchesPage'
    ).then((m) => ({
      default:
        m.AdminBatchesPage,
    })),
  )

const AdminEventsPage =
  lazy(() =>
    import(
      '@/features/admin/pages/AdminEventsPage'
    ).then((m) => ({
      default:
        m.AdminEventsPage,
    })),
  )

const AdminInspectionsPage =
  lazy(() =>
    import(
      '@/features/admin/pages/AdminInspectionsPage'
    ).then((m) => ({
      default:
        m.AdminInspectionsPage,
    })),
  )

const AdminCertificatesPage =
  lazy(() =>
    import(
      '@/features/admin/pages/AdminCertificatesPage'
    ).then((m) => ({
      default:
        m.AdminCertificatesPage,
    })),
  )

const AdminRecallsPage =
  lazy(() =>
    import(
      '@/features/admin/pages/AdminRecallsPage'
    ).then((m) => ({
      default:
        m.AdminRecallsPage,
    })),
  )

export const router =
  createBrowserRouter([
    {
      path: '/login',
      element: <LoginPage />,
    },

    {
      path: '/register',
      element: <RegisterPage />,
    },

    {
      element:
        <ProtectedRoute />,

      children: [
        // ====================
        // ADMIN
        // ====================

        {
          element:
            <AdminRoute />,

          children: [
            {
              path: 'admin',

              element:
                <AdminLayout />,

              children: [
                {
                  index: true,

                  element:
                    <AdminDashboardPage />,
                },

                {
                  path: 'roles',

                  element:
                    <AdminRolesPage />,
                },

                {
                  path: 'units',

                  element:
                    <AdminUnitsPage />,
                },

                {
                  path: 'users',

                  element:
                    <AdminUsersPage />,
                },

                {
                  path: 'products',

                  element:
                    <AdminProductsPage />,
                },

                {
                  path: 'batches',

                  element:
                    <AdminBatchesPage />,
                },

                {
                  path: 'events',

                  element:
                    <AdminEventsPage />,
                },

                {
                  path:
                    'inspections',

                  element:
                    <AdminInspectionsPage />,
                },

                {
                  path:
                    'certificates',

                  element:
                    <AdminCertificatesPage />,
                },

                {
                  path: 'recalls',

                  element:
                    <AdminRecallsPage />,
                },
              ],
            },
          ],
        },

        // ====================
        // CODE CŨ
        // ====================

        {
          element:
            <AppLayout />,

          children: [
            {
              index: true,

              element:
                <HomePage />,
            },

            {
              path: 'users',

              element:
                <UsersListPage />,
            },
          ],
        },
      ],
    },

    {
      path: '*',

      element:
        <NotFoundPage />,
    },
  ])