# Agricultural Supply Chain Traceability — FE

React 19 + Vite, TypeScript (strict), **MUI** (`@mui/material` + `@mui/icons-material`),
Zustand (client state) + TanStack Query (server state), Axios with interceptors, i18next,
and Vitest.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Tài khoản test từ seed database BE:

- Admin: **`admin@agritrace.vn` / `P@ssw0rd123`** → `/admin`
- OrgAdmin: **`orgadmin@sonlafarm.vn` / `P@ssw0rd123`** → `/admin`
- Farmer: **`farmer@sonlafarm.vn` / `P@ssw0rd123`**
- Inspector: **`inspector@agritrace.vn` / `P@ssw0rd123`**

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server với HMR |
| `npm run build` | Type-check (`tsc -b`) + build production vào `dist/` |
| `npm run preview` | Chạy thử bản build production |
| `npm run lint` | oxlint |
| `npm run format` / `format:check` | Prettier write / check |
| `npm run typecheck` | Type-check, không emit |
| `npm test` / `test:watch` / `test:coverage` | Vitest |

## Kiến trúc

State chia theo **ai sở hữu dữ liệu**:

- **Server state** (mọi thứ fetch từ API) → **TanStack Query**. Cache, refetch, retry,
  invalidate nằm ở đây, theo mẫu `<entity>.queries.ts` mô tả bên dưới khi nối API thật.
- **Client/UI state** (session, dialog, filter, mock data tạm khi chưa có BE) → **Zustand**
  hoặc local state. Xem `features/auth/auth.store.ts`, `features/admin/admin.store.ts`.

Quy tắc quan trọng nhất: **đừng để server data nằm trong Zustand, và đừng để UI state nằm
trong Query.**

### UI: chuẩn hoá theo MUI

Toàn bộ UI dùng **MUI** (`sx` prop) — không dùng Tailwind, không dùng thư viện icon nào khác
ngoài `@mui/icons-material`. Bộ Tailwind ui-kit ban đầu (`Button`/`Card`/`Input`/`Spinner` tự
viết) đã được gỡ bỏ vì trùng lặp với MUI.

- `config/theme.ts` — `createTheme()` dùng chung, chỉnh màu thương hiệu/typography ở **một
  chỗ duy nhất**, không hardcode hex trong component.
- `components/ui/` — component MUI dùng chung cho **mọi** feature: `DataTable`, `StatCard`,
  `StatusChip`, `PageHeader`, `PageLoader`. Cần bảng/dialog/stat card mới thì tái dùng hoặc
  mở rộng ở đây trước khi viết riêng trong feature.
- `layouts/` — `MainLayout` (AppBar top-nav, cho các trang đã đăng nhập ngoài Admin) và
  `PublicLayout` (shell tối giản, không cần đăng nhập — dùng cho trang tra cứu QR công khai
  sau này). Admin có `AdminLayout` riêng (sidebar) trong `features/admin/components/`.

### Folder structure

```
src/
├── app/                  # App-wide wiring
│   ├── providers.tsx     # StrictMode + MUI Theme + Query + i18n providers
│   ├── query-client.ts   # TanStack Query defaults (retry, staleTime)
│   └── router.tsx        # Route table với lazy() code splitting
├── config/
│   ├── env.ts            # Typed access tới import.meta.env
│   ├── theme.ts           # MUI theme dùng chung
│   └── constants.ts       # Hằng số dùng chung (label/màu trạng thái...)
├── utils/
│   └── format.ts          # formatCurrency/formatNumber/formatDate/formatDateTime
├── lib/
│   ├── api/
│   │   ├── http.ts         # Axios instance + interceptors + ApiError
│   │   └── token-storage.ts
│   └── i18n/               # i18next init + locale en/vi
├── layouts/
│   ├── MainLayout.tsx      # Shell cho user đã đăng nhập (trừ Admin)
│   └── PublicLayout.tsx    # Shell công khai, không cần đăng nhập
├── components/
│   └── ui/                 # DataTable, StatCard, StatusChip, PageHeader, PageLoader
├── features/                # Feature-first — xem quy ước bên dưới
│   ├── auth/                # Cross-cutting: login/register/RoleRoute/ProtectedRoute
│   ├── admin/                # Console quản trị (NGOẠI LỆ — xem bên dưới)
│   ├── batches/               # LoHang — tạo lô, chi tiết lô, danh sách
│   ├── products/               # SanPham — scaffold rỗng, chưa code
│   ├── events/                  # SuKien — scaffold rỗng, chưa code
│   ├── quality/                   # KiemDinh + ChungNhan — scaffold rỗng, chưa code
│   ├── recalls/                    # CanhBaoThuHoi + ThongBaoThuHoi — scaffold rỗng
│   ├── dashboard/                    # Thống kê cá nhân theo role — scaffold rỗng
│   └── trace/                          # Tra cứu QR công khai — scaffold rỗng
├── pages/                # Trang cross-feature (Home, NotFound)
├── hooks/                # Custom hook dùng chung (useDebounce)
├── test/                 # Vitest setup
└── main.tsx              # Entry: providers + RouterProvider
```

### Quy ước tổ chức `features/`

Chia theo **entity nghiệp vụ** (khớp với các bounded context bên BE: `Products`, `Batches`,
`Events`, `Inspections`/`Certificates`, `Recalls`, `Dashboard`), **không chia theo role**.
Lý do: một lô hàng (`LoHang`) được Farmer tạo → Processor xử lý → Distributor vận chuyển →
Inspector kiểm định → Admin giám sát — nếu chia theo role sẽ phải lặp lại UI 5 lần. Thay vào
đó, mỗi feature tự xử lý phân quyền bên trong (vd. `BatchesPage` chỉ hiện nút "Tạo lô hàng"
khi `user.role === 'Farmer'`).

Mỗi feature theo khuôn (những gì chưa cần thì bỏ qua, không tạo file rỗng):
```
features/<entity>/
├── components/          # Component riêng của feature
├── pages/                # Các trang (List/Detail/Create...)
├── <entity>.types.ts       # Kiểu dữ liệu
├── <entity>.api.ts          # Gọi API qua lib/api/http
├── <entity>.queries.ts        # TanStack Query hooks (khi đã có API thật)
└── <entity>.store.ts            # Zustand — chỉ khi cần UI state hoặc mock data tạm
```

**Ngoại lệ duy nhất: `features/admin/`.** Đây là console quản trị tổng (Roles/Units/Users +
xem toàn bộ dữ liệu mọi entity), không map 1-1 với một bảng DB, nên tổ chức theo role thay vì
entity. Có `AdminLayout`/`AdminSidebar` riêng.

### Path alias

`@/` → `src/` (cấu hình ở `vite.config.ts` và `tsconfig.app.json`). Import
`@/features/batches/...` thay vì đường dẫn tương đối dài.

### HTTP layer (`lib/api/http.ts`)

- **Request interceptor** gắn `Authorization: Bearer <token>`.
- **Response interceptor** thực hiện refresh token **một lần, dedupe** khi gặp `401`, replay
  lại request gốc, nếu thất bại thì bắn event `auth:logout` cho auth store xử lý.
- Mọi lỗi được chuẩn hoá thành **`ApiError`** (`status`, `code`, `fieldErrors`) — UI và query
  luôn branch trên đây, không branch trên raw Axios error.

### Auth & route guard

- `ProtectedRoute` (`features/auth/ProtectedRoute.tsx`) — chặn user chưa đăng nhập, redirect
  `/login` và nhớ URL đích để quay lại sau khi login.
- `RoleRoute` (`features/auth/RoleRoute.tsx`) — route guard **dùng chung cho mọi role**
  (`<RoleRoute roles={['Admin']} />`), thay vì viết một guard riêng cho từng role.
- Mock hiện nằm ở `features/auth/auth.api.ts` — thay bằng `http.post('/auth/login')` thật khi
  có BE.

## Cách thêm 1 feature mới (entity)

Ví dụ thêm **Products** (SanPham) cho role không phải Admin dùng:

1. `src/features/products/products.types.ts` — `Product`, `CreateProductInput`.
2. `products.api.ts` — gọi Axios qua `@/lib/api/http`.
3. `products.queries.ts` — `useProducts`, `useCreateProduct`,... theo mẫu `productKeys` factory.
4. `pages/ProductsListPage.tsx` — UI, dùng `@/components/ui/*` (DataTable, PageHeader...).
5. Đăng ký route lazy trong `src/app/router.tsx`, bọc trong `MainLayout` (hoặc `RoleRoute` nếu
   cần giới hạn role).
6. Thêm key i18n trong `lib/i18n/locales/*.json`.
7. Thêm test cạnh component (`*.test.tsx`).

## Testing

Vitest + Testing Library, môi trường jsdom, setup ở `src/test/setup.ts`. Chạy `npm test`.

## Configuration

Copy `.env.example` → `.env`. Biến lộ ra client phải có tiền tố `VITE_`:

| Var | Ý nghĩa |
|---|---|
| `VITE_APP_NAME` | Tên hiển thị |
| `VITE_API_BASE_URL` | Base URL của BE |
| `VITE_DEFAULT_LOCALE` | Ngôn ngữ mặc định |
| `VITE_ENABLE_MOCK` | Cờ dự phòng cho mock toggle |

`.env.production` set `VITE_API_BASE_URL=/api` cho reverse-proxy deployment.

## Docker

```bash
docker build -t agri-trace-fe .
docker run -p 8080:80 agri-trace-fe
```

Multi-stage build (Node → nginx). `nginx.conf` có SPA fallback + asset caching.
