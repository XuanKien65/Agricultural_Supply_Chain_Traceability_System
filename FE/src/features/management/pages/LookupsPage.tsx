import {
  useEffect,
  useState,
} from 'react'

import {
  CategoryRounded,
  GroupsRounded,
  TimelineRounded,
} from '@mui/icons-material'

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material'

import {
  managementApi,
} from '../management.api'

import type {
  LookupItem,
} from '../management.types'

import ManagementPageHeader from '../components/ManagementPageHeader'

function normalizeItems(
  values:
    | LookupItem[]
    | string[],
): LookupItem[] {
  return values.map(
    (item) => {
      if (
        typeof item ===
        'string'
      ) {
        return {
          value: item,
          label: item,
        }
      }

      return item
    },
  )
}

interface LookupCardProps {
  title: string
  description: string
  items: LookupItem[]
  icon: React.ReactNode
}

function LookupCard({
  title,
  description,
  items,
  icon,
}: LookupCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
        minHeight: 220,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 1,
        }}
      >
        <Box
          sx={{
            color:
              'success.main',
            display: 'flex',
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="h6"
          fontWeight={800}
        >
          {title}
        </Typography>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
        }}
      >
        {description}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {items.map(
          (item) => (
            <Chip
              key={
                item.value
              }
              label={
                item.label ??
                item.name ??
                item.value
              }
              variant="outlined"
              color="success"
            />
          ),
        )}

        {items.length ===
          0 && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Không có dữ liệu.
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default function LookupsPage() {
  const [roles, setRoles] =
    useState<LookupItem[]>(
      [],
    )

  const [
    organizationTypes,
    setOrganizationTypes,
  ] =
    useState<LookupItem[]>(
      [],
    )

  const [
    eventTypes,
    setEventTypes,
  ] =
    useState<LookupItem[]>(
      [],
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          rolesResult,
          organizationTypesResult,
          eventTypesResult,
        ] =
          await Promise.all([
            managementApi.getRoles(),
            managementApi.getOrganizationTypes(),
            managementApi.getEventTypes(),
          ])

        setRoles(
          normalizeItems(
            rolesResult,
          ),
        )

        setOrganizationTypes(
          normalizeItems(
            organizationTypesResult,
          ),
        )

        setEventTypes(
          normalizeItems(
            eventTypesResult,
          ),
        )
      } catch {
        setError(
          'Không thể tải danh mục hệ thống. Hãy kiểm tra lại endpoint Lookup trong Swagger.',
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <Box>
      <ManagementPageHeader
        title="Danh mục hệ thống"
        description="Các giá trị dùng chung trong AgriTrace."
      />

      {error && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            minHeight: 240,
            display: 'flex',
            justifyContent:
              'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              lg:
                'repeat(3, 1fr)',
            },

            gap: 3,
          }}
        >
          <LookupCard
            title="Vai trò"
            description="Các vai trò người dùng trong hệ thống."
            items={roles}
            icon={
              <GroupsRounded />
            }
          />

          <LookupCard
            title="Loại tổ chức"
            description="Các loại đơn vị tham gia chuỗi cung ứng."
            items={
              organizationTypes
            }
            icon={
              <CategoryRounded />
            }
          />

          <LookupCard
            title="Loại sự kiện"
            description="Các loại sự kiện trong chuỗi truy xuất."
            items={
              eventTypes
            }
            icon={
              <TimelineRounded />
            }
          />
        </Box>
      )}
    </Box>
  )
}