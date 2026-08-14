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

// ==========================================
// P1: PUBLIC PAGES (Cổng Tra Cứu Nguồn Gốc Công Khai)
// ==========================================
const LoginPage = lazyPage(() => import('@/features/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyPage(() => import('@/features/auth/RegisterPage'), 'RegisterPage')
const HomePage = lazyPage(() => import('@/pages/HomePage'), 'HomePage')
const TracePublicPage = lazyPage(() => import('@/features/trace/pages/TracePublicPage'), 'TracePublicPage')

// ==========================================
// P2: ACTOR PAGES (Chuỗi cung ứng)
// ==========================================
// Dashboard
const ActorDashboardPage = lazyPage(() => import('@/features/dashboard/pages/ActorDashboardPage'), 'ActorDashboardPage')
const FarmerDashboardPage = lazyPage(() => import('@/features/dashboard/pages/FarmerDashboardPage'), 'FarmerDashboardPage')

// Lô hàng (Batches)
const BatchesPage = lazyPage(() => import('@/features/batches/pages/BatchesPage'), 'BatchesPage')
const CreateBatchPage = lazyPage(() => import('@/features/batches/pages/CreateBatchPage'), 'CreateBatchPage')
const BatchDetailPage = lazyPage(() => import('@/features/batches/pages/BatchDetailPage'), 'BatchDetailPage')

// Sự kiện chuỗi cung ứng (Chain of Custody Events)
const EventsPage = lazyPage(() => import('@/features/events/pages/EventsPage'), 'EventsPage')
const CreateEventPage = lazyPage(() => import('@/features/events/pages/CreateEventPage'), 'CreateEventPage')
const EventDetailPage = lazyPage(() => import('@/features/events/pages/EventDetailPage'), 'EventDetailPage')
const RecordEventPage = lazyPage(() => import('@/features/events/pages/RecordEventPage'), 'RecordEventPage')

// Sản phẩm & Chứng nhận (Products)
const ProductsPage = lazyPage(() => import('@/features/products/pages/ProductsPage'), 'ProductsPage')
const CreateProductPage = lazyPage(() => import('@/features/products/pages/CreateProductPage'), 'CreateProductPage')
const ProductDetailPage = lazyPage(() => import('@/features/products/pages/ProductDetailPage'), 'ProductDetailPage')

// Chất lượng & Thu hồi (Quality & Recalls)
const QualityInspectionsPage = lazyPage(() => import('@/features/quality/pages/QualityInspectionsPage'), 'QualityInspectionsPage')
const CreateInspectionPage = lazyPage(() => import('@/features/quality/pages/CreateInspectionPage'), 'CreateInspectionPage')
const InspectionDetailPage = lazyPage(() => import('@/features/quality/pages/InspectionDetailPage'), 'InspectionDetailPage')

const RecallsPage = lazyPage(() => import('@/features/recalls/pages/RecallsPage'), 'RecallsPage')
const CreateRecallPage = lazyPage(() => import('@/features/recalls/pages/CreateRecallPage'), 'CreateRecallPage')
const RecallDetailPage = lazyPage(() => import('@/features/recalls/pages/RecallDetailPage'), 'RecallDetailPage')

// ==========================================
// P3: ADMIN PAGES
// ==========================================
const AdminDashboardPage = lazyPage(() => import('@/features/admin/pages/AdminDashboardPage'), 'AdminDashboardPage')
const AdminRolesPage = lazyPage(() => import('@/features/admin/pages/AdminRolesPage'), 'AdminRolesPage')
const AdminUnitsPage = lazyPage(() => import('@/features/admin/pages/AdminUnitsPage'), 'AdminUnitsPage')
const AdminUsersPage = lazyPage(() => import('@/features/admin/pages/AdminUsersPage'), 'AdminUsersPage')
const AdminProductsPage = lazyPage(() => import('@/features/admin/pages/AdminProductsPage'), 'AdminProductsPage')

// --- ROUTER CONFIGURATION ---
export const router = createBrowserRouter([
  // 1. PUBLIC ROUTES (Người tiêu dùng quét QR / tra cứu không cần đăng nhập)
  { path: '/', element: <HomePage /> },
  { path: '/trace', element: <HomePage /> },
  { path: '/trace/:batchId', element: <TracePublicPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // 2. PROTECTED ROUTES
  {
    element: <ProtectedRoute />,
    children: [
      // ---------------------------------------------------------
      // NHÁNH A: QUẢN TRỊ VIÊN (Admin)
      // ---------------------------------------------------------
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
            ],
          },
        ],
      },

      // ---------------------------------------------------------
      // NHÁNH B: CHUỖI CUNG ỨNG (MainLayout)
      // ---------------------------------------------------------
      {
        element: <MainLayout />,
        children: [
          // Dashboard chung
          {
            element: <RoleRoute roles={['Farmer', 'Processor', 'Distributor', 'Retailer', 'Inspector']} />,
            children: [
              { path: 'dashboard', element: <ActorDashboardPage /> },
              { path: 'farmer', element: <FarmerDashboardPage /> },
              { path: 'batches', element: <BatchesPage /> },
              { path: 'batches/:batchId', element: <BatchDetailPage /> },
              { path: 'events', element: <EventsPage /> },
              { path: 'events/new', element: <CreateEventPage /> },
              { path: 'events/:eventId', element: <EventDetailPage /> },
              { path: 'products', element: <ProductsPage /> },
              { path: 'products/new', element: <CreateProductPage /> },
              { path: 'products/:productId', element: <ProductDetailPage /> },
            ],
          },

          // Quyền riêng của Farmer
          {
            element: <RoleRoute roles={['Farmer']} />,
            children: [
              { path: 'batches/new', element: <CreateBatchPage /> },
            ],
          },

          // Quyền Ghi nhận sự kiện chuỗi
          {
            element: <RoleRoute roles={['Farmer', 'Processor', 'Distributor', 'Retailer']} />,
            children: [
              { path: 'batches/:batchId/events/new', element: <CreateEventPage /> },
              { path: 'record-event', element: <RecordEventPage /> },
              { path: 'record-event/:batchId', element: <RecordEventPage /> },
            ],
          },

          // Quyền Kiểm định & Thu hồi
          {
            element: <RoleRoute roles={['Inspector', 'Admin']} />,
            children: [
              { path: 'quality', element: <QualityInspectionsPage /> },
              { path: 'quality/new', element: <CreateInspectionPage /> },
              { path: 'quality/:inspectionId', element: <InspectionDetailPage /> },
              { path: 'recalls', element: <RecallsPage /> },
              { path: 'recalls/new', element: <CreateRecallPage /> },
              { path: 'recalls/:recallId', element: <RecallDetailPage /> },
            ],
          },
        ],
      },
    ],
  },

  // 3. BẮT LỖI 404
  { path: '*', element: <NotFoundPage /> },
])