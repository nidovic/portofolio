import { beforeEach, expect, it, vi } from 'vitest'
import { apiRequest } from './apiClient.js'
import { listUsers, updateUserRole } from './userRepository.js'

vi.mock('./apiClient.js', () => ({ apiRequest: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

it('lists users and updates a role with authorization', async () => {
  apiRequest.mockResolvedValue([{ name: 'Alex', role: 'user' }])
  await expect(listUsers('token')).resolves.toEqual([{ name: 'Alex', role: 'user' }])
  expect(apiRequest).toHaveBeenLastCalledWith('/api/users', { token: 'token' })
  await updateUserRole('id/1', 'admin', 'token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/users/id%2F1', { method: 'PUT', body: { role: 'admin' }, token: 'token' })
})

it('propagates authorization errors', async () => {
  const error = new Error('Forbidden')
  apiRequest.mockRejectedValue(error)
  await expect(updateUserRole('id', 'admin', 'token')).rejects.toBe(error)
})
