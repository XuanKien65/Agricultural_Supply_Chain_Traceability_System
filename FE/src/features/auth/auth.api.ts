import { http } from '@/lib/api/http'
import type {
  ApiResponse,
  AuthUser,
  BackendAuthUserResult,
  BackendLoginResult,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from './auth.types'

function toAuthUser(u: BackendAuthUserResult): AuthUser {
  return {
    id: u.userId,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    organizationId: u.organizationId,
    organizationName: u.organizationName,
    organizationType: u.organizationType,
    name: u.fullName || u.email,
  }
}

export const authApi = {
  /**
   * Đăng nhập với backend API: POST /api/v1/auth/login
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await http.post<ApiResponse<BackendLoginResult>>('/v1/auth/login', {
      email: payload.email,
      password: payload.password,
    })

    const data = res.data
    if (!data.isSuccess || !data.result) {
      const msg = data.errorMessages?.[0] || 'Đăng nhập thất bại'
      throw new Error(msg)
    }

    return {
      accessToken: data.result.accessToken,
      refreshToken: data.result.refreshToken,
      user: toAuthUser(data.result.user),
    }
  },

  /**
   * Đăng ký: BE hiện chưa có endpoint POST /auth/register — gọi sẽ trả 404
   * cho tới khi backend bổ sung. Giữ lại để UI đăng ký compile được.
   */
  async register(_payload: RegisterPayload): Promise<LoginResponse> {
    throw new Error('Chức năng đăng ký chưa được backend hỗ trợ.')
  },

  /**
   * Lấy thông tin user hiện tại từ token: GET /api/v1/auth/me
   */
  async getMe(): Promise<AuthUser> {
    const res = await http.get<ApiResponse<BackendAuthUserResult>>('/v1/auth/me')
    const data = res.data
    if (!data.isSuccess || !data.result) {
      throw new Error('Không thể lấy thông tin người dùng')
    }

    return toAuthUser(data.result)
  },

  /**
   * Đổi mật khẩu: PUT /api/v1/auth/change-password
   */
  async changePassword(payload: {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
  }): Promise<void> {
    const res = await http.put<ApiResponse<unknown>>('/v1/auth/change-password', payload)
    const data = res.data
    if (!data.isSuccess) {
      const msg = data.errorMessages?.[0] || 'Đổi mật khẩu thất bại.'
      throw new Error(msg)
    }
  },
}
