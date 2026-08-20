import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

/**
 * RecallsPage - Danh sách các yêu cầu thu hồi sản phẩm
 * Quản lý các lô hàng bị recall do vấn đề chất lượng
 * Cho phép truy vết ngược (traceback) và gửi cảnh báo tới các actor
 */
export function RecallsPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // NEW CODE - Fetch recalls list
  const { data, isLoading } = useQuery({
    queryKey: ['recalls', currentPage, searchTerm],
    queryFn: async () => {
      // const response = await recallService.getRecalls({ search: searchTerm, pageNumber: currentPage, pageSize: 10 })
      // return response
      return {
        items: [
          {
            id: 'R001',
            batchId: 'B001',
            product: 'Dâu tây tươi',
            reason: 'Phát hiện vi khuẩn Salmonella',
            status: 'Active',
            severity: 'High',
            initiatedDate: new Date().toISOString(),
            affectedBatches: 3,
            notifiedUnits: 5,
          },
        ],
        totalCount: 1,
      }
    },
  })

  if (isLoading) return <div>Đang tải...</div>

  return (
    <div className="space-y-4">
      {/* NEW CODE - Recalls management header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Quản lý Thu hồi Sản phẩm
        </h1>
        <Button onClick={() => navigate('/recalls/new')} variant="destructive">
          + Phát hành Recall
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Tìm kiếm mã lô, mã recall..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã Recall</TableHead>
            <TableHead>Mã Lô</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Lý do Thu hồi</TableHead>
            <TableHead>Mức độ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Lô bị ảnh hưởng</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items?.map((recall: any) => (
            <TableRow key={recall.id}>
              <TableCell className="font-medium">{recall.id}</TableCell>
              <TableCell>{recall.batchId}</TableCell>
              <TableCell>{recall.product}</TableCell>
              <TableCell className="text-sm">{recall.reason}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    recall.severity === 'High'
                      ? 'destructive'
                      : recall.severity === 'Medium'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {recall.severity === 'High' ? 'Cao' : recall.severity === 'Medium' ? 'Trung bình' : 'Thấp'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={recall.status === 'Active' ? 'destructive' : 'default'}>
                  {recall.status === 'Active' ? 'Đang hoạt động' : 'Đã hoàn thành'}
                </Badge>
              </TableCell>
              <TableCell>{recall.affectedBatches}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/recalls/${recall.id}`)}
                >
                  Chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
