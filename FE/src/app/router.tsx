import { lazy, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { RoleRoute } from '@/features/auth/RoleRoute'
import { AdminLayout } from '@/features/admin/components/AdminLayout'
import { NotFoundPage } from '@/pages/NotFoundPage'

function lazyPage(loader: () => Promise<Record<string, ComponentType>>, exportName: string) {
  return lazy(() => loader().then((m) => ({ default: m[exportName] as ComponentType })))
}

const LoginPage = lazyPage(() => import('@/features/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyPage(() => import('@/features/auth/RegisterPage'), 'RegisterPage')
const HomePage = lazyPage(() => import('@/pages/HomePage'), 'HomePage')

const BatchesPage = lazyPage(() => import('@/features/batches/pages/BatchesPage'), 'BatchesPage')
const CreateBatchPage = lazyPage(() => import('@/features/batches/pages/CreateBatchPage'), 'CreateBatchPage')
const BatchDetailPage = lazyPage(() => import('@/features/batches/pages/BatchDetailPage'), 'BatchDetailPage')

const AdminDashboardPage = lazyPage(() => import('@/features/admin/pages/AdminDashboardPage'), 'AdminDashboardPage')
const AdminRolesPage = lazyPage(() => import('@/features/admin/pages/AdminRolesPage'), 'AdminRolesPage')
const AdminUnitsPage = lazyPage(() => import('@/features/admin/pages/AdminUnitsPage'), 'AdminUnitsPage')
const AdminUsersPage = lazyPage(() => import('@/features/admin/pages/AdminUsersPage'), 'AdminUsersPage')
const AdminProductsPage = lazyPage(() => import('@/features/admin/pages/AdminProductsPage'), 'AdminProductsPage')
const AdminBatchesPage = lazyPage(() => import('@/features/admin/pages/AdminBatchesPage'), 'AdminBatchesPage')
const AdminEventsPage = lazyPage(() => import('@/features/admin/pages/AdminEventsPage'), 'AdminEventsPage')
const AdminInspectionsPage = lazyPage(() => import('@/features/admin/pages/AdminInspectionsPage'), 'AdminInspectionsPage')
const AdminCertificatesPage = lazyPage(() => import('@/features/admin/pages/AdminCertificatesPage'), 'AdminCertificatesPage')
const AdminRecallsPage = lazyPage(() => import('@/features/admin/pages/AdminRecallsPage'), 'AdminRecallsPage')

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute roles={['Admin']} />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'roles', element: <AdminRolesPage /> },
              { path: 'units', element: <AdminUnitsPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'products', element: <AdminProductsPage /> },
              { path: 'batches', element: <AdminBatchesPage /> },
              { path: 'events', element: <AdminEventsPage /> },
              { path: 'inspections', element: <AdminInspectionsPage /> },
              { path: 'certificates', element: <AdminCertificatesPage /> },
              { path: 'recalls', element: <AdminRecallsPage /> },
            ],
          },
        ],
      },

      {
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'batches', element: <BatchesPage /> },
          { path: 'batches/new', element: <CreateBatchPage /> },
          { path: 'batches/:batchId', element: <BatchDetailPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])
