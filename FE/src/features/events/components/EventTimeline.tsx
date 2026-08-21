import { useState } from 'react'
import { Box, Chip, Tooltip, Typography, IconButton } from '@mui/material'
import { ContentCopyRounded, CheckRounded } from '@mui/icons-material'
import type { BatchEvent, EventType } from '../events.types'

const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; icon: string; bg: string }> = {
  HARVEST: { label: 'Thu hoạch', color: '#15803D', icon: '🌾', bg: '#DCFCE7' },
  PROCESS: { label: 'Sơ chế & Chế biến', color: '#0369A1', icon: '⚙️', bg: '#E0F2FE' },
  PACKAGE: { label: 'Đóng gói', color: '#6D28D9', icon: '📦', bg: '#F3E8FF' },
  TRANSPORT: { label: 'Vận chuyển', color: '#B45309', icon: '🚛', bg: '#FEF3C7' },
  RECEIVE: { label: 'Tiếp nhận', color: '#1D4ED8', icon: '🏪', bg: '#DBEAFE' },
  INSPECT: { label: 'Kiểm định QC', color: '#B91C1C', icon: '🛡️', bg: '#FEE2E2' },
  SPLIT: { label: 'Tách lô', color: '#475569', icon: '✂️', bg: '#F1F5F9' },
  MERGE: { label: 'Gộp lô', color: '#475569', icon: '🔗', bg: '#F1F5F9' },
}

interface ParsedData {
  type: 'parsed' | 'text'
  details?: { label: string; value: string; icon: string }[]
  content?: string
}

interface Props {
  events: BatchEvent[]
}

function parseDataContent(rawStr?: string | null): ParsedData | null {
  if (!rawStr) return null
  const trimmed = rawStr.trim()

  // Trường hợp dữ liệu dạng JSON string
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed)
      const details: { label: string; value: string; icon: string }[] = []

      if (parsed.field) details.push({ label: 'Nội dung', value: String(parsed.field), icon: '📝' })
      if (parsed.weight) details.push({ label: 'Khối lượng', value: `${parsed.weight} kg`, icon: '⚖️' })
      if (parsed.temperature) details.push({ label: 'Nhiệt độ', value: `${parsed.temperature}°C`, icon: '🌡️' })
      if (parsed.humidity) details.push({ label: 'Độ ẩm', value: `${parsed.humidity}%`, icon: '💧' })
      if (parsed.vehicle) details.push({ label: 'Phương tiện', value: String(parsed.vehicle), icon: '🚛' })
      if (parsed.notes) details.push({ label: 'Ghi chú', value: String(parsed.notes), icon: '📋' })

      if (details.length > 0) return { type: 'parsed', details }
    } catch {
      // Fallback nếu parse JSON thất bại
    }
  }

  // Loại bỏ các đoạn JSON nếu dính kèm chữ
  let cleanText = trimmed
  if (cleanText.includes('{')) {
    cleanText = cleanText.replace(/\{.*?\}/g, '').trim()
  }

  return cleanText ? { type: 'text', content: cleanText } : null
}

export function EventTimeline({ events }: Props) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  function handleCopy(hash: string) {
    navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  if (!events || events.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontSize: 14 }}>
        Chưa có sự kiện nào được ghi nhận cho lô hàng này.
      </Typography>
    )
  }

  return (
    <Box sx={{ position: 'relative', pl: { xs: 1, sm: 2 }, py: 1 }}>
      {/* Đường nối Timeline dọc */}
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          bottom: 24,
          left: { xs: 21, sm: 29 },
          width: 3,
          bgcolor: '#E2E8F0',
          borderRadius: 2,
          zIndex: 0,
        }}
      />

      {events.map((event, index) => {
        const config = EVENT_TYPE_CONFIG[event.eventType] || {
          label: event.eventType,
          color: '#475569',
          icon: '📌',
          bg: '#F1F5F9',
        }
        const dataParsed = parseDataContent(event.additionalData)
        const isCopied = copiedHash === event.currentHash

        return (
          <Box
            key={event.eventId}
            sx={{
              position: 'relative',
              display: 'flex',
              gap: 2.5,
              mb: 3,
              zIndex: 1,
              '&:last-child': { mb: 0 },
            }}
          >
            {/* Node Icon đại diện cho Sự kiện */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: config.bg,
                border: `2px solid ${config.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
                boxShadow: `0 0 0 4px #FFFFFF`,
              }}
            >
              {config.icon}
            </Box>

            {/* Nội dung chi tiết sự kiện */}
            <Box
              sx={{
                flex: 1,
                bgcolor: '#FFFFFF',
                border: '1px solid',
                borderColor: '#E2E8F0',
                borderRadius: 3,
                p: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: config.color,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
              }}
            >
              {/* Header Sự kiện */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`#${index + 1} ${config.label}`}
                    sx={{
                      bgcolor: config.bg,
                      color: config.color,
                      fontWeight: 800,
                      fontSize: 12,
                      borderRadius: 1.5,
                    }}
                    size="small"
                  />
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    {new Date(event.eventTime).toLocaleString('vi-VN')}
                  </Typography>
                </Box>

                {event.location && (
                  <Typography variant="caption" sx={{ bgcolor: '#F8FAFC', color: '#475569', px: 1.2, py: 0.4, borderRadius: 1, border: '1px solid #E2E8F0', fontWeight: 600 }}>
                    📍 {event.location}
                  </Typography>
                )}
              </Box>

              {/* Dữ liệu sự kiện được Format đẹp mắt */}
              {dataParsed && (
                <Box sx={{ my: 1.5, pt: 1, borderTop: '1px dashed #E2E8F0' }}>
                  {dataParsed.type === 'parsed' && dataParsed.details ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {dataParsed.details.map((item, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.8,
                            bgcolor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            px: 1.2,
                            py: 0.6,
                            borderRadius: 1.5,
                            fontSize: 12,
                          }}
                        >
                          <span>{item.icon}</span>
                          <span style={{ color: '#64748B', fontWeight: 500 }}>{item.label}:</span>
                          <strong style={{ color: '#0F172A' }}>{item.value}</strong>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, fontSize: 13, lineHeight: 1.5 }}>
                      {dataParsed.content}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Mã Hash SHA-256 Bảo mật */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5, pt: 1, borderTop: '1px solid #F1F5F9' }}>
                <Tooltip
                  title={`Full SHA-256 Hash: ${event.currentHash}`}
                  placement="top"
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: '#0F172A',
                        color: '#38BDF8',
                        fontSize: 12,
                        fontFamily: 'monospace',
                        p: 1.5,
                        borderRadius: 2,
                        boxShadow: 4,
                      },
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: '#475569',
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.8,
                      '&:hover': { color: '#0284C7', borderColor: '#38BDF8' },
                    }}
                  >
                    🔒 SHA-256:{' '}
                    <strong>
                      {event.currentHash
                        ? `${event.currentHash.substring(0, 16)}...${event.currentHash.substring(event.currentHash.length - 8)}`
                        : 'N/A'}
                    </strong>
                  </Typography>
                </Tooltip>

                {event.currentHash && (
                  <Tooltip title={isCopied ? 'Đã sao chép!' : 'Sao chép mã Hash'}>
                    <IconButton size="small" onClick={() => handleCopy(event.currentHash)} sx={{ ml: 1, p: 0.5, color: isCopied ? '#16A34A' : '#94A3B8' }}>
                      {isCopied ? <CheckRounded fontSize="small" /> : <ContentCopyRounded fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
