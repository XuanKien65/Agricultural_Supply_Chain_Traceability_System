import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Package,
  Store,
  Sprout,
  ArrowRight,
  Lock,
  Sparkles,
  LogIn,
  LayoutDashboard,
  X,
  Camera,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth.store'

// Dữ liệu các lô hàng mẫu để người dùng thử nghiệm nhanh
const SAMPLE_BATCHES = [
  {
    id: 'B001',
    product: 'Dâu tây tươi Đà Lạt',
    category: 'Trái cây cao cấp',
    farm: 'Nông trại ABC, Đà Lạt, Lâm Đồng',
    harvestDate: '15/01/2026',
    certifications: ['VietGAP', 'Organic'],
    status: 'Đã phân phối tới siêu thị',
    icon: '🍓',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'B002',
    product: 'Cà chua bi Organic',
    category: 'Rau củ quả',
    farm: 'Trang trại Nông nghiệp Xanh, Đơn Dương',
    harvestDate: '18/01/2026',
    certifications: ['GlobalGAP', 'Organic'],
    status: 'Đang vận chuyển lạnh',
    icon: '🍅',
    badgeColor: 'bg-green-100 text-green-800 border-green-300',
  },
  {
    id: 'B003',
    product: 'Dưa lưới ruột cam Nhật Bản',
    category: 'Trái cây nhà kính',
    farm: 'Khu Nông nghiệp Công nghệ cao Củ Chi',
    harvestDate: '20/01/2026',
    certifications: ['VietGAP', 'ISO 22000'],
    status: 'Đã kiểm định chất lượng',
    icon: '🍈',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [batchIdInput, setBatchIdInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showQrModal, setShowQrModal] = useState(false)

  // Xử lý tra cứu khi submit form
  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = batchIdInput.trim()
    if (!trimmed) {
      setErrorMsg('Vui lòng nhập mã lô hàng (Ví dụ: B001, B002)')
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
              href="#tech"
              className="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-emerald-700 transition"
            >
              Công nghệ Hash Chain
            </a>

            {/* Nút Điều hướng User hoặc Đăng nhập */}
            {user ? (
              <Link
                to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
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
        {/* Họa tiết nền mờ */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge nhận diện */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs sm:text-sm font-medium text-emerald-100 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Cổng Tra cứu Công khai &bull; Minh bạch Vòng đời Nông sản</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            Minh Bạch Nguồn Gốc <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-green-200 to-teal-100">
              Từ Nông Trại Đến Bàn Ăn
            </span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Tra cứu ngay lịch sử thu hoạch, kiểm định chất lượng VietGAP, lộ trình vận chuyển nhiệt độ và xác thực tính toàn vẹn dữ liệu bằng công nghệ Hash Chain.
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
                  placeholder="Nhập mã lô hàng (Ví dụ: B001, B002, B003)..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  title="Quét mã QR"
                  className="px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1 text-sm font-medium"
                >
                  <QrCode className="w-5 h-5 text-emerald-700" />
                  <span className="sm:hidden">Quét QR</span>
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
              <span className="font-medium">Thử tra cứu nhanh mã mẫu:</span>
              <div className="flex flex-wrap gap-1.5">
                {['B001', 'B002', 'B003'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleQuickTrace(code)}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    Mã {code}
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
              Lô Hàng Đang Lưu Thông Mẫu
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
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                      Mã: {batch.id}
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
                  <span>Xem hành trình chi tiết</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. QUY TRÌNH CHUỖI CUNG ỨNG 6 MẮT XÍCH */}
      <section id="how-it-works" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Hành Trình Chuỗi Cung Ứng Nông Sản
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Tất cả các sự kiện được ghi nhận thời gian thực và liên kết chuỗi băm bất biến.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                step: '01',
                title: 'Thu Hoạch',
                actor: 'Nông Dân',
                desc: 'Khởi tạo lô hàng, gắn mã QR, nhật ký phân bón.',
                icon: Sprout,
                color: 'text-green-600 bg-green-50 border-green-200',
              },
              {
                step: '02',
                title: 'Kiểm Định',
                actor: 'Cán Bộ QC',
                desc: 'Đo lường dư lượng, kiểm tra tiêu chuẩn VietGAP.',
                icon: ShieldCheck,
                color: 'text-teal-600 bg-teal-50 border-teal-200',
              },
              {
                step: '03',
                title: 'Sơ Chế & Đóng Gói',
                actor: 'Nhà Máy',
                desc: 'Làm sạch, phân loại quy cách, đóng thùng tiêu chuẩn.',
                icon: Package,
                color: 'text-blue-600 bg-blue-50 border-blue-200',
              },
              {
                step: '04',
                title: 'Vận Chuyển',
                actor: 'Logistics',
                desc: 'Xe chuyên dụng, giám sát nhiệt độ và độ ẩm.',
                icon: Truck,
                color: 'text-amber-600 bg-amber-50 border-amber-200',
              },
              {
                step: '05',
                title: 'Phân Phối / Bán Lẻ',
                actor: 'Siêu Thị',
                desc: 'Tiếp nhận vào kho mát, bày bán lên kệ siêu thị.',
                icon: Store,
                color: 'text-purple-600 bg-purple-50 border-purple-200',
              },
              {
                step: '06',
                title: 'Tra Cứu Nguồn Gốc',
                actor: 'Người Tiêu Dùng',
                desc: 'Quét mã QR bằng điện thoại xem toàn bộ hành trình.',
                icon: QrCode,
                color: 'text-emerald-700 bg-emerald-100 border-emerald-300 font-bold',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col items-center text-center shadow-sm relative hover:shadow-md transition"
              >
                <div className="text-[10px] font-black text-slate-400 mb-2">{item.step}</div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-3 ${item.color}`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h4>
                <span className="text-[11px] font-semibold text-emerald-700 mb-2">
                  {item.actor}
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CÔNG NGHỆ BẢO VỆ DỮ LIỆU (HASH CHAIN / BLOCKCHAIN-LITE) */}
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

      {/* 6. MODAL HƯỚNG DẪN QUÉT QR */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Quét Mã QR Nông Sản</h3>
              <p className="text-sm text-slate-600 mb-6">
                Sử dụng camera điện thoại hoặc ứng dụng Zalo / Quét mã trên bao bì nông sản để tự động mở trang tra cứu.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs text-slate-700 space-y-2 mb-6">
                <p>
                  <strong>Cách 1:</strong> Mở camera trên điện thoại &bull; Hướng vào mã QR in trên tem nhãn.
                </p>
                <p>
                  <strong>Cách 2:</strong> Hoặc nhập trực tiếp mã lô hàng (ví dụ: <span className="font-mono font-bold text-emerald-700">B001</span>) vào thanh tìm kiếm ở trang chủ.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowQrModal(false)
                    handleQuickTrace('B001')
                  }}
                  className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold text-sm hover:bg-emerald-800 transition"
                >
                  Thử xem mã mẫu B001
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <span>AgriTraceability System</span>
          </div>
          <p className="text-center sm:text-right">
            Đề tài 02: Hệ thống Truy xuất Nguồn gốc Nông sản theo Chuỗi Cung ứng &bull; Clean Architecture & React
          </p>
        </div>
      </footer>
    </div>
  )
}
