import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  QrCode,
  CheckCircle2,
  Sprout,
  ArrowRight,
  Lock,
  Sparkles,
  LogIn,
  LayoutDashboard,
  Users,
  Building,
  Activity,
  Layers,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth.store'
import { QrScannerDialog } from '@/features/batches/components/QrScannerDialog'
import { publicTraceApi, type LookupItem } from '@/features/trace/trace.api'

// Dữ liệu các lô hàng mẫu để người dùng thử nghiệm nhanh
const SAMPLE_BATCHES = [
  {
    id: '1',
    code: 'B001',
    product: 'Dâu tây tươi Đà Lạt',
    category: 'Trái cây cao cấp',
    farm: 'Nông trại Sơn La Farm',
    harvestDate: '15/01/2026',
    certifications: ['VietGAP', 'Organic EU'],
    status: 'Đã phân phối tới siêu thị',
    icon: '🍓',
  },
  {
    id: '2',
    code: 'B002',
    product: 'Cà chua bi Organic',
    category: 'Rau củ quả',
    farm: 'Hợp tác xã Mộc Châu',
    harvestDate: '18/01/2026',
    certifications: ['GlobalGAP', 'Organic'],
    status: 'Đang vận chuyển lạnh',
    icon: '🍅',
  },
  {
    id: '3',
    code: 'B003',
    product: 'Dưa lưới ruột cam Nhật Bản',
    category: 'Trái cây nhà kính',
    farm: 'Nông nghiệp Công nghệ cao Củ Chi',
    harvestDate: '20/01/2026',
    certifications: ['VietGAP', 'ISO 22000'],
    status: 'Đã kiểm định chất lượng',
    icon: '🍈',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [batchIdInput, setBatchIdInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showQrDialog, setShowQrDialog] = useState(false)

  // Lookup state
  const [roles, setRoles] = useState<LookupItem[]>([])
  const [orgTypes, setOrgTypes] = useState<LookupItem[]>([])
  const [eventTypes, setEventTypes] = useState<LookupItem[]>([])

  useEffect(() => {
    // Fetch public lookup categories from Backend
    Promise.all([
      publicTraceApi.getRoles().catch(() => []),
      publicTraceApi.getOrganizationTypes().catch(() => []),
      publicTraceApi.getEventTypes().catch(() => []),
    ]).then(([r, o, e]) => {
      setRoles(r)
      setOrgTypes(o)
      setEventTypes(e)
    })
  }, [])

  // Xử lý tra cứu khi submit form
  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = batchIdInput.trim()
    if (!trimmed) {
      setErrorMsg('Vui lòng nhập mã lô hàng (Ví dụ: B001, 1, 2)')
      return
    }
    setErrorMsg('')
    navigate(`/trace/${encodeURIComponent(trimmed)}`)
  }

  // Tra cứu nhanh từ lô hàng mẫu
  const handleQuickTrace = (id: string) => {
    navigate(`/trace/${id}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. HEADER / NAVBAR CÔNG KHAI */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Tên hệ thống */}
          <Link to="/" className="flex items-center gap-2.5 group text-decoration-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-500 flex items-center justify-center text-white shadow-md shadow-green-700/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-emerald-800 tracking-tight block leading-tight">
                AgriTrace
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Truy xuất Nguồn gốc Nông sản
              </span>
            </div>
          </Link>

          {/* Navigation Links & Action */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="#how-it-works"
              className="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-emerald-700 transition"
            >
              Quy trình chuỗi
            </a>
            <a
              href="#samples"
              className="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-emerald-700 transition"
            >
              Lô hàng mẫu
            </a>
            <a
              href="#directory"
              className="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-emerald-700 transition"
            >
              Danh mục công khai
            </a>

            {/* Nút Điều hướng User hoặc Đăng nhập */}
            {user ? (
              <Link
                to={user.role === 'ORGADMIN' ? '/admin/organization' : user.role === 'ADMIN' ? '/admin' : user.role === 'FARMER' ? '/farmer' : '/dashboard'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-semibold hover:bg-emerald-100 transition shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Bảng điều khiển ({user.name || user.role})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition shadow-sm shadow-emerald-700/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập Cán bộ</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION - CỔNG TRA CỨU TRỌNG TÂM */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs sm:text-sm font-medium text-emerald-100 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Cổng Tra cứu Công khai &bull; Dành cho Người Tiêu Dùng</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            Minh Bạch Nguồn Gốc <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-green-200 to-teal-100">
              Từ Nông Trại Đến Bàn Ăn
            </span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Tra cứu công khai lịch sử thu hoạch, kiểm định chất lượng VietGAP, lộ trình vận chuyển nhiệt độ và sơ đồ phả hệ tách/gộp lô hàng bằng mã băm SHA-256 bảo mật.
          </p>

          {/* Ô TÌM KIẾM TRUNG TÂM */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl shadow-black/30 max-w-2xl mx-auto border border-emerald-100/20 text-slate-800">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={batchIdInput}
                  onChange={(e) => {
                    setBatchIdInput(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  placeholder="Nhập mã lô hàng (Ví dụ: B001, 1, 2)..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowQrDialog(true)}
                  title="Quét camera mã QR"
                  className="px-3.5 py-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition flex items-center justify-center gap-1 text-sm font-bold shadow-sm"
                >
                  <QrCode className="w-5 h-5 text-emerald-700" />
                  <span>Quét Camera QR</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-700/30 transition flex items-center justify-center gap-2"
                >
                  <span>Tra cứu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {errorMsg && (
              <p className="mt-2 text-xs sm:text-sm text-red-600 text-left pl-2 font-medium">
                {errorMsg}
              </p>
            )}

            {/* Gợi ý bấm nhanh */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span className="font-medium">Thử tra cứu nhanh mẫu:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_BATCHES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleQuickTrace(b.id)}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    Lô #{b.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DANH SÁCH LÔ HÀNG MẪU ĐỂ XEM THỬ NGHIỆM */}
      <section id="samples" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Lô Hàng Nông Sản Đã Xác Thực
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Nhấp trực tiếp vào bất kỳ lô hàng nào dưới đây để trải nghiệm tính năng tra cứu toàn diện.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_BATCHES.map((batch) => (
              <div
                key={batch.id}
                onClick={() => handleQuickTrace(batch.id)}
                className="group bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-500/50 hover:bg-white transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                      {batch.icon}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Mã: {batch.code}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition mb-1">
                    {batch.product}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-3">{batch.category}</p>

                  <div className="space-y-2 text-xs text-slate-600 mb-4 bg-white p-3 rounded-xl border border-slate-100">
                    <p>
                      <strong className="text-slate-800">Nông trại:</strong> {batch.farm}
                    </p>
                    <p>
                      <strong className="text-slate-800">Thu hoạch:</strong> {batch.harvestDate}
                    </p>
                    <p>
                      <strong className="text-slate-800">Trạng thái:</strong> {batch.status}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {batch.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        ✓ {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  <span>Xem hành trình & Phả hệ lô hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DANH MỤC HỆ THỐNG TRA CỨU CÔNG KHAI (PUBLIC LOOKUP) */}
      <section id="directory" className="py-16 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-900 mb-3">
              <Layers className="w-4 h-4" />
              <span>Public Directory &bull; Tra cứu Danh mục</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Danh Mục Hệ Thống Chuỗi Cung Ứng
            </h2>
            <p className="text-sm text-slate-600">
              Cung cấp các danh mục công khai chuẩn hóa (`Roles`, `Organization Types`, `Event Types`).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Vai trò người dùng */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Vai Trò Hệ Thống</h3>
                  <p className="text-xs text-slate-500">GET /api/v1/roles</p>
                </div>
              </div>
              <div className="space-y-2">
                {(roles.length > 0
                  ? roles
                  : [
                      { name: 'FARMER', description: 'Nông dân nông trại khởi tạo lô hàng' },
                      { name: 'INSPECTOR', description: 'Cán bộ kiểm định chất lượng QC' },
                      { name: 'OPERATOR', description: 'Nhà chế biến, sơ chế & vận chuyển' },
                      { name: 'ORGADMIN', description: 'Quản trị viên đại diện Tổ chức' },
                    ]
                ).map((r, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border text-xs">
                    <span className="font-bold text-blue-700 block">{r.name || r.key}</span>
                    <span className="text-slate-600">{r.description || r.value || 'Vai trò công khai'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Loại tổ chức */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Loại Hình Tổ Chức</h3>
                  <p className="text-xs text-slate-500">GET /api/v1/organization-types</p>
                </div>
              </div>
              <div className="space-y-2">
                {(orgTypes.length > 0
                  ? orgTypes
                  : [
                      { name: 'FARM', description: 'Nông trại canh tác & thu hoạch' },
                      { name: 'PROCESSOR', description: 'Nhà máy chế biến & sơ chế' },
                      { name: 'DISTRIBUTOR', description: 'Đơn vị logistics & vận chuyển' },
                      { name: 'RETAILER', description: 'Siêu thị & Điểm bán lẻ' },
                    ]
                ).map((o, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border text-xs">
                    <span className="font-bold text-emerald-700 block">{o.name || o.key}</span>
                    <span className="text-slate-600">{o.description || o.value || 'Đơn vị cung ứng'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Loại sự kiện */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Loại Sự Kiện Chuỗi</h3>
                  <p className="text-xs text-slate-500">GET /api/v1/event-types</p>
                </div>
              </div>
              <div className="space-y-2">
                {(eventTypes.length > 0
                  ? eventTypes
                  : [
                      { name: 'HARVEST', description: 'Thu hoạch nông sản từ cánh đồng' },
                      { name: 'PROCESS', description: 'Sơ chế, làm sạch & chế biến' },
                      { name: 'TRANSPORT', description: 'Vận chuyển xe lạnh giám sát nhiệt độ' },
                      { name: 'RETAIL', description: 'Tiếp nhận & bày bán tại siêu thị' },
                    ]
                ).map((e, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border text-xs">
                    <span className="font-bold text-purple-700 block">{e.name || e.key}</span>
                    <span className="text-slate-600">{e.description || e.value || 'Sự kiện nhật ký'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CÔNG NGHỆ BẢO VỆ DỮ LIỆU (HASH CHAIN) */}
      <section id="tech" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-4">
                <Lock className="w-3.5 h-3.5" />
                <span>Toàn vẹn dữ liệu &bull; Append-Only</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Công Nghệ Hash Chain <br />
                Chống Làm Giả Lịch Sử
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
                Mỗi mắt xích khi ghi nhận sự kiện (thu hoạch, kiểm định, vận chuyển...) đều tạo ra một mã băm mật mã <strong>SHA-256</strong> gắn kết trực tiếp với mã băm của sự kiện trước đó.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-slate-900 block">Dữ liệu Bất biến (Immutable):</strong>
                    <span className="text-xs sm:text-sm text-slate-600">
                      Không cho phép chỉnh sửa hoặc xóa sự kiện lịch sử đã ghi nhận vào chuỗi.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-slate-900 block">Phát hiện gian lận tức thời:</strong>
                    <span className="text-xs sm:text-sm text-slate-600">
                      Bất kỳ thay đổi trái phép nào tại một mắt xích sẽ làm đứt gãy chuỗi băm (Hash Mismatch) và bị cảnh báo ngay.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-slate-900 block">Truy vết ngược (Traceback Recall):</strong>
                    <span className="text-xs sm:text-sm text-slate-600">
                      Khi có sự cố an toàn thực phẩm, hệ thống tự động truy xuất ngược về nông trại và khoanh vùng các lô liên quan.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Minh họa Hash Chain */}
            <div className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-2xl shadow-xl font-mono text-xs space-y-4 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-emerald-400 font-bold">🔗 Hash Chain Verification Protocol</span>
                <span className="text-slate-400 text-[10px]">SHA-256</span>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                <div className="text-emerald-300 font-semibold">Event #1: HARVEST (Thu hoạch)</div>
                <div className="text-slate-400">PreviousHash: null (Root)</div>
                <div className="text-amber-300 truncate">CurrentHash: 9b2d8f1e4a3b...c72e</div>
              </div>

              <div className="text-center text-slate-500">↓ linked by previousHash ↓</div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                <div className="text-emerald-300 font-semibold">Event #2: INSPECTION (Kiểm định)</div>
                <div className="text-amber-300 truncate">PreviousHash: 9b2d8f1e4a3b...c72e</div>
                <div className="text-cyan-300 truncate">CurrentHash: a4f91c78e23b...8d01</div>
              </div>

              <div className="text-center text-slate-500">↓ linked by previousHash ↓</div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                <div className="text-emerald-300 font-semibold">Event #3: TRANSPORT (Vận chuyển xe lạnh)</div>
                <div className="text-cyan-300 truncate">PreviousHash: a4f91c78e23b...8d01</div>
                <div className="text-green-400 truncate">CurrentHash: 6e7c10b48a12...99ff (VERIFIED ✓)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CAMERA QR SCANNER DIALOG */}
      <QrScannerDialog
        open={showQrDialog}
        onClose={() => setShowQrDialog(false)}
        onScanned={(scannedId) => {
          setShowQrDialog(false)
          navigate(`/trace/${scannedId}`)
        }}
      />

      {/* 7. FOOTER */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <span>AgriTraceability System</span>
          </div>
          <p className="text-center sm:text-right text-slate-400">
            Hệ thống Truy xuất Nguồn gốc Nông sản Minh bạch Chuỗi Cung ứng &bull; © 2026 AgriTrace.
          </p>
        </div>
      </footer>
    </div>
  )
}
