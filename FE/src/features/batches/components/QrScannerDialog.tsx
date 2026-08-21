import { useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { CloseRounded } from '@mui/icons-material'
import { Html5Qrcode } from 'html5-qrcode'

const SCANNER_ELEMENT_ID = 'qr-scanner-viewport'

/** Mã QR lưu URL trang tra cứu (`.../trace/{id}`) hoặc số ID thuần. */
export function parseBatchIdFromScan(text: string): number | null {
  const trimmed = text.trim()
  if (/^\d+$/.test(trimmed)) return Number(trimmed)
  const match = trimmed.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : null
}

interface Props {
  open: boolean
  onClose: () => void
  onScanned: (batchId: number) => void
}

export function QrScannerDialog({ open, onClose, onScanned }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          const batchId = parseBatchIdFromScan(decodedText)
          if (batchId) {
            onScanned(batchId)
          } else {
            setError(`Không đọc được mã lô từ nội dung quét: "${decodedText}"`)
          }
        },
        () => {
          /* lỗi từng khung hình — bỏ qua, chỉ đợi khung hợp lệ tiếp theo */
        },
      )
      .catch((err: unknown) => {
        if (!cancelled) setError('Không thể mở camera. Hãy cấp quyền camera cho trình duyệt và thử lại.')
        console.error(err)
      })

    return () => {
      cancelled = true
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          /* camera đã dừng hoặc chưa từng khởi động thành công */
        })
      scannerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Quét mã QR lô hàng
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box id={SCANNER_ELEMENT_ID} sx={{ width: '100%', minHeight: 280, '& video': { borderRadius: 2 } }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}
