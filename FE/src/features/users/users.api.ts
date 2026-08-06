import type { CreateUserInput, UpdateUserInput, User } from './users.types'

/**
 * Mock users backend — no BE yet. Swap for real calls once the API is ready:
 *   list:   http.get<User[]>('/users').then((r) => r.data)
 *   create: http.post<User>('/users', input).then((r) => r.data)
 */

let mockUsers: User[] = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    username: 'nguyenvanan',
    email: 'nguyenvanan@gmail.com',
    phone: '0901234567',
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    username: 'tranthibinh',
    email: 'tranthibinh@gmail.com',
    phone: '0912345678',
  },
  {
    id: 3,
    name: 'Lê Hoàng Sơn',
    username: 'lehoangson',
    email: 'lehoangson@gmail.com',
    phone: '0923456789',
  },
  {
    id: 4,
    name: 'Phạm Thị Hoa',
    username: 'phamthihoa',
    email: 'phamthihoa@gmail.com',
    phone: '0934567890',
  },
  {
    id: 5,
    name: 'Hoàng Văn Long',
    username: 'hoangvanlong',
    email: 'hoangvanlong@gmail.com',
    phone: '0945678901',
  },
]

let nextId = mockUsers.length + 1

export const usersApi = {
  async list(): Promise<User[]> {
    await new Promise((r) => setTimeout(r, 300))
    return mockUsers
  },

  async get(id: number): Promise<User> {
    await new Promise((r) => setTimeout(r, 300))
    const user = mockUsers.find((u) => u.id === id)
    if (!user) throw new Error('Không tìm thấy người dùng')
    return user
  },

  async create(input: CreateUserInput): Promise<User> {
    await new Promise((r) => setTimeout(r, 300))
    const user: User = { id: nextId++, ...input }
    mockUsers = [...mockUsers, user]
    return user
  },

  async update(id: number, input: UpdateUserInput): Promise<User> {
    await new Promise((r) => setTimeout(r, 300))
    const existing = mockUsers.find((u) => u.id === id)
    if (!existing) throw new Error('Không tìm thấy người dùng')
    const updated = { ...existing, ...input }
    mockUsers = mockUsers.map((u) => (u.id === id ? updated : u))
    return updated
  },

  async remove(id: number): Promise<number> {
    await new Promise((r) => setTimeout(r, 300))
    mockUsers = mockUsers.filter((u) => u.id !== id)
    return id
  },
}
