import { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import {
  ApartmentRounded,
  EmailRounded,
  LocationOnRounded,
  PeopleAltRounded,
  PhoneRounded,
  Inventory2Rounded,
  VerifiedUserRounded,
} from '@mui/icons-material'
import { useAuthStore } from '@/features/auth/auth.store'
import { adminApi } from '../admin.api'
import type { AdminOrganization, AdminUser, AdminProduct } from '../admin.types'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'

export function AdminOrganizationDetailPage() {
  const user = useAuthStore((state) => state.user)
  const orgId = user?.organizationId

  const [org, setOrg] = useState<AdminOrganization | null>(null)
  const [members, setMembers] = useState<AdminUser[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)

  useEffect(() => {
    async function loadOrgData() {
      if (!orgId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const [orgData, usersData, productsData] = await Promise.all([
          adminApi.getOrganizationById(orgId).catch(() => null),
          adminApi.getUsers().catch(() => []),
          adminApi.getProducts().catch(() => []),
        ])

        if (orgData) {
          setOrg(orgData)
        } else {
          // Fallback if detail query wasn't available
          const allOrgs = await adminApi.getOrganizations().catch(() => [])
          const match = allOrgs.find((o) => o.id === orgId)
          if (match) setOrg(match)
        }

        setMembers(usersData.filter((u) => u.organizationId === orgId))
        setProducts(productsData.filter((p) => p.organizationId === orgId))
      } finally {
        setLoading(false)
      }
    }

    loadOrgData()
  }, [orgId])

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!orgId || !org) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" sx={{ fontWeight: 700 }}>
          Không tìm thấy thông tin Tổ chức liên kết với tài khoản của bạn.
        </Typography>
      </Box>
    )
  }

  const isOrgActive = org.isActive ?? (org.status === 'ACTIVE' || org.status === 'ACT')

  const memberColumns: DataTableColumn<AdminUser>[] = [
    {
      key: 'fullName',
      label: 'Họ và tên',
      render: (u) => (
        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
          {u.fullName || u.email}
        </Typography>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (u) => <Typography sx={{ fontSize: 13 }}>{u.email}</Typography>,
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (u) => (
        <Chip
          label={u.role}
          size="small"
          color={u.role === 'ORGADMIN' ? 'primary' : u.role === 'INSPECTOR' ? 'info' : 'default'}
          sx={{ fontWeight: 800, fontSize: 11 }}
        />
      ),
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (u) => (
        <Chip
          label={u.isActive ? 'Hoạt động' : 'Tạm khóa'}
          size="small"
          color={u.isActive ? 'success' : 'error'}
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: 11 }}
        />
      ),
    },
  ]

  const productColumns: DataTableColumn<AdminProduct>[] = [
    {
      key: 'name',
      label: 'Tên sản phẩm',
      render: (p) => (
        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
          {p.name || `Sản phẩm #${p.id}`}
        </Typography>
      ),
    },
    {
      key: 'category',
      label: 'Phân loại',
      render: (p) => <Typography sx={{ fontSize: 13 }}>{p.category || 'Nông sản'}</Typography>,
    },
    {
      key: 'unit',
      label: 'Quy cách / Đơn vị',
      render: (p) => <Typography sx={{ fontSize: 13 }}>{p.unit || 'kg'}</Typography>,
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Profile Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #123D24 0%, #1E5631 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 32, fontWeight: 900 }}>
            <ApartmentRounded fontSize="large" />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {org.name}
              </Typography>
              <Chip
                label={org.type || 'TỔ CHỨC'}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 800, fontSize: 12 }}
              />
              <Chip
                label={isOrgActive ? 'Đang hoạt động' : 'Tạm dừng'}
                size="small"
                sx={{ bgcolor: isOrgActive ? '#81C784' : '#E57373', color: '#111', fontWeight: 800, fontSize: 11 }}
              />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnRounded fontSize="small" />
              {org.address || 'Chưa cập nhật địa chỉ'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Grid Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
              THÔNG TIN LIÊN HỆ
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <VerifiedUserRounded color="action" fontSize="small" />
                <Box>
                  <Typography color="text.secondary" sx={{ fontSize: 11 }}>
                    Người đại diện
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    {org.contactPerson || user?.name || '---'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PhoneRounded color="action" fontSize="small" />
                <Box>
                  <Typography color="text.secondary" sx={{ fontSize: 11 }}>
                    Số điện thoại
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    {org.phone || '---'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailRounded color="action" fontSize="small" />
                <Box>
                  <Typography color="text.secondary" sx={{ fontSize: 11 }}>
                    Email liên hệ
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    {org.email || user?.email || '---'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 3 }}>
            <PeopleAltRounded color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 900 }}>
              {members.length}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13, fontWeight: 700 }}>
              Thành viên nội bộ
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 3 }}>
            <Inventory2Rounded color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 900 }}>
              {products.length}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13, fontWeight: 700 }}>
              Sản phẩm đăng ký
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={`Thành viên tổ chức (${members.length})`} sx={{ fontWeight: 800, textTransform: 'none' }} />
            <Tab label={`Danh mục sản phẩm (${products.length})`} sx={{ fontWeight: 800, textTransform: 'none' }} />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          {tab === 0 && <DataTable columns={memberColumns} rows={members} getRowId={(r) => r.id} />}
          {tab === 1 && <DataTable columns={productColumns} rows={products} getRowId={(r) => r.id} />}
        </Box>
      </Paper>
    </Box>
  )
}
