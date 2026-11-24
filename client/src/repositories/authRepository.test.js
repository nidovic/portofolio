import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from './apiClient.js'
import { getCurrentUser, signIn, signOut, signUp } from './authRepository.js'

vi.mock('./apiClient.js', () => ({ apiRequest: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

describe('authRepository', () => {
  it.each([
    [signIn, { email: 'alex@example.test', password: 'password' }, '/api/auth/signin'],
    [signUp, { name: 'Alex', email: 'alex@example.test', password: 'password' }, '/api/auth/signup'],
  ])('sends credentials to %s', async (request, credentials, path) => {
    apiRequest.mockResolvedValue({ token: 'test-token', user: { name: 'Alex' } })
    await expect(request(credentials)).resolves.toMatchObject({ user: { name: 'Alex' } })
    expect(apiRequest).toHaveBeenCalledWith(path, { method: 'POST', body: credentials })
  })

  it('uses the token for the current user and sign-out', async () => {
    await getCurrentUser('test-token')
    expect(apiRequest).toHaveBeenLastCalledWith('/api/auth/me', { token: 'test-token' })
    await signOut('test-token')
    expect(apiRequest).toHaveBeenLastCalledWith('/api/auth/signout', { method: 'POST', token: 'test-token' })
  })

  it('propagates authentication failures', async () => {
    const error = new Error('Invalid credentials')
    apiRequest.mockRejectedValue(error)
    await expect(signIn({ email: 'alex@example.test' })).rejects.toBe(error)
  })
})
