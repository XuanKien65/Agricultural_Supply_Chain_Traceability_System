import { http } from '@/lib/api/http'
import {
  ROLE_TO_ID,
  type ApiResponse,
  type AuthUser,
  type BackendCurrentUserResult,
  type BackendLoginResult,
  type BackendRegisterResult,
  type LoginPayload,
  type LoginResponse,
  type RegisterPayload,
} from './auth.types'

export const authApi = {
  /**
   * Đăng nhập với backend API: POST /api/auth/login
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await http.post<ApiResponse<BackendLoginResult>>('/auth/login', {
      username: payload.username,
      password: payload.password,
    })

    const data = res.data
    if (!data.isSuccess || !data.result) {
      const msg = data.errorMessages?.[0] || 'Đăng nhập thất bại'
      throw new Error(msg)
    }

    const { token, userId, username, fullName, email, role, organizationId } = data.result

    const user: AuthUser = {
      id: userId,
      username,
      fullName,
      name: fullName || username,
      email,
      role,
      unitName: null,
      organizationId,
    }

    return {
      accessToken: token,
      user,
    }
  },

  /**
   * Đăng ký với backend API: POST /api/auth/register
   */
  async register(payload: RegisterPayload): Promise<LoginResponse> {
    const roleId = ROLE_TO_ID[payload.role] ?? 2

    const res = await http.post<ApiResponse<BackendRegisterResult>>('/auth/register', {
      username: payload.username || payload.email,
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
      roleId,
      organizationId: payload.organizationId ?? null,
    })

    const data = res.data
    if (!data.isSuccess || !data.result) {
      const msg = data.errorMessages?.[0] || 'Đăng ký thất bại'
      throw new Error(msg)
    }

    // Tự động đăng nhập ngay sau khi đăng ký thành công
    return this.login({
      username: payload.username || payload.email,
      password: payload.password,
    })
  },

  /**
   * Lấy thông tin user hiện tại từ token: GET /api/auth/me
   */
  async getMe(): Promise<AuthUser> {
    const res = await http.get<ApiResponse<BackendCurrentUserResult>>('/auth/me')
    const data = res.data
    if (!data.isSuccess || !data.result) {
      throw new Error('Không thể lấy thông tin người dùng')
    }

    const { userId, username, fullName, email, role, organizationId } = data.result

    return {
      id: userId,
      username,
      fullName,
      name: fullName || username,
      email,
      role,
      unitName: null,
      organizationId,
    }
  },
}
