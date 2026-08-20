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

import { QualityInspectionsPage }
  from '@/features/quality/pages/QualityInspectionsPage'

import { CreateInspectionMUIPage }
  from '@/features/quality/pages/CreateInspectionMUIPage'

import { CertificatesPage }
  from '@/features/quality/pages/CertificatesPage'

import { RecallsPage }
  from '@/features/recalls/pages/RecallsPage'

import { CreateRecallPage }
  from '@/features/recalls/pages/CreateRecallPage'

import { TracePublicPage }
  from '@/features/trace/pages/TracePublicPage'

import { LineagePage }
  from '@/features/trace/pages/LineagePage'

import { PublicTraceHomePage }
  from '@/features/trace/pages/PublicTraceHomePage'

import { NotificationsPage }
  from '@/features/notifications/pages/NotificationsPage'

import { PublicLayout }
  from '@/layouts/PublicLayout'

import { MainLayout }
  from '@/layouts/MainLayout'

import { BatchesPage }
  from '@/features/batches/pages/BatchesPage'

import { CreateBatchPage }
  from '@/features/batches/pages/CreateBatchPage'

import { BatchDetailPage }
  from '@/features/batches/pages/BatchDetailPage'

import { EventsPage }
  from '@/features/events/pages/EventsPage'

import { RecordEventPage }
  from '@/features/events/pages/RecordEventPage'

import { AnalyticsPage }
  from '@/features/dashboard/pages/AnalyticsPage'

import { RecallNotificationsPage }
  from '@/features/recalls/pages/RecallNotificationsPage'

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

  if (
    user?.role === 'FARMER' ||
    user?.role === 'OPERATOR'
  ) {
    return (
      <Navigate
        to="/dashboard"
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

function HomeEntry() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  )

  if (!isAuthenticated) {
    return <PublicTraceHomePage />
  }

  return <HomeRedirect />
}

export const router =
  createBrowserRouter([
    {
      path: '/login',

      element:
        <LoginPage />,
    },

    {
      element: <PublicLayout />,

      children: [
        {
          path: '/',

          element: <HomeEntry />,
        },

        {
          path: '/trace/:batchId',

          element: <TracePublicPage />,
        },

        {
          path: '/trace/:batchId/lineage',

          element: <LineagePage />,
        },
      ],
    },

    {
      element:
        <AuthGuard />,

      children: [
        {
          path: '/',

          element: <HomeEntry />,
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
                'INSPECTOR',
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
                  path: 'quality',

                  element: <QualityInspectionsPage />,
                },

                {
                  path: 'quality/new',

                  element: <CreateInspectionMUIPage />,
                },

                {
                  path: 'certificates',

                  element: <CertificatesPage />,
                },

                {
                  path: 'recalls',

                  element: <RecallsPage />,
                },

                {
                  path: 'recalls/new',

                  element: <CreateRecallPage />,
                },

                {
                  path: 'notifications',

                  element: <NotificationsPage />,
                },

                {
                  path: 'analytics',

                  element: <AnalyticsPage />,
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

        {
          element: <MainLayout />,

          children: [
            {
              element: (
                <RoleGuard
                  roles={[
                    'FARMER',
                    'OPERATOR',
                    'ADMIN',
                    'ORGADMIN',
                  ]}
                />
              ),

              children: [
                {
                  path: '/dashboard',

                  element: <AnalyticsPage />,
                },

                {
                  path: '/batches',

                  element: <BatchesPage />,
                },

                {
                  path: '/batches/new',

                  element: <CreateBatchPage />,
                },

                {
                  path: '/batches/:batchId',

                  element: <BatchDetailPage />,
                },

                {
                  path: '/events',

                  element: <EventsPage />,
                },

                {
                  path: '/events/new',

                  element: <RecordEventPage />,
                },

                {
                  path: '/events/:batchId',

                  element: <RecordEventPage />,
                },

                {
                  path: '/recall-notifications',

                  element: <RecallNotificationsPage />,
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