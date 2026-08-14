import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, ArrowLeft, Sprout } from 'lucide-react'

/**
 * NotFoundPage - Trang 404 thân thiện với người dùng
 */
export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-slate-200 text-center p-8 rounded-2xl bg-white">
        <CardContent className="p-0 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <Sprout className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tight">404</h1>
            <h2 className="text-lg font-bold text-slate-800 mt-2">Trang Không Tồn Tại</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Địa chỉ bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển trong hệ thống AgriTrace.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </Button>

            <Button
              size="sm"
              asChild
              className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
            >
              <Link to="/">
                <Home className="w-4 h-4" />
                <span>Về Cổng Tra Cứu</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
