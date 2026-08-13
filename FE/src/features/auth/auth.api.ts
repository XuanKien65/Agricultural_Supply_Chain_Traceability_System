import type { AuthUser, LoginPayload, LoginResponse, RegisterPayload } from './auth.types'

/**
 * Mock auth backend — no BE yet. Swap for real calls once the API is ready:
 *   login:    http.post<LoginResponse>('/auth/login', p).then((r) => r.data)
 *   register: http.post<LoginResponse>('/auth/register', p).then((r) => r.data)
 */

interface MockAccount {
  user: AuthUser
  password: string
}

const mockAccounts: MockAccount[] = [
  {
    password: '123456',
    user: {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'admin@gmail.com',
      role: 'Admin',
      unitName: null,
    },
  },
  {
    password: '123456',
    user: {
      id: 2,
      name: 'Trần Minh Nông',
      email: 'farmer@gmail.com',
      role: 'Farmer',
      unitName: 'Nông trại Xanh Đà Lạt',
      organizationId: 1,
    },
  },
]

let nextId = 3

function findAccount(email: string) {
  return mockAccounts.find((a) => a.user.email.toLowerCase() === email.toLowerCase())
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    await new Promise((r) => setTimeout(r, 500))
    const account = findAccount(payload.email)
    if (!account || account.password !== payload.password) {
      const err = new Error('invalidCredentials')
      err.name = 'InvalidCredentials'
      throw err
    }
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: account.user,
    }
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    await new Promise((r) => setTimeout(r, 500))
    if (findAccount(payload.email)) {
      const err = new Error('emailTaken')
      err.name = 'EmailTaken'
      throw err
    }
    const user: AuthUser = {
      id: nextId++,
      name: payload.fullName,
      email: payload.email,
      role: payload.role,
      unitName: payload.unitName,
      organizationId: nextId,
    }
    mockAccounts.push({ user, password: payload.password })
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user,
    }
  },
}
