import { beforeEach, expect, it, vi } from 'vitest'
import { apiRequest } from './apiClient.js'
import { createQualification, deleteQualification, listPortfolioQualifications, listQualifications, updateQualification } from './qualificationRepository.js'

vi.mock('./apiClient.js', () => ({ apiRequest: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

it('lists and localizes qualification records', async () => {
  apiRequest.mockResolvedValue([{ slug: 'degree', title: 'Degree', titleFr: 'Diplôme', description: 'Studies', location: 'Toronto' }])
  await expect(listQualifications()).resolves.toHaveLength(1)
  expect(apiRequest).toHaveBeenCalledWith('/api/qualifications')
  expect((await listPortfolioQualifications())[0]).toMatchObject({
    id: 'degree', title: { en: 'Degree', fr: 'Diplôme' }, location: { en: 'Toronto', fr: 'Toronto' },
  })
})

it('sends authenticated qualification mutations and encodes identifiers', async () => {
  const body = { title: 'Degree' }
  await createQualification(body, 'token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/qualifications', { method: 'POST', body, token: 'token' })
  await updateQualification('id/1', body, 'token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/qualifications/id%2F1', { method: 'PUT', body, token: 'token' })
  await deleteQualification('id/1', 'token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/qualifications/id%2F1', { method: 'DELETE', token: 'token' })
})

it('propagates loading errors', async () => {
  const error = new Error('Offline')
  apiRequest.mockRejectedValue(error)
  await expect(listPortfolioQualifications()).rejects.toBe(error)
})
