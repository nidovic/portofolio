import { beforeEach, expect, it, vi } from 'vitest'
import { apiRequest } from './apiClient.js'
import { createProject, deleteProject, listPortfolioProjects, listProjects, updateProject } from './projectRepository.js'

vi.mock('./apiClient.js', () => ({ apiRequest: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

it('lists and transforms projects into display-ready localized records', async () => {
  apiRequest.mockResolvedValue([{ _id: 'p1', title: 'Project', description: 'Description', sourceUrl: 'https://example.test' }])
  await expect(listProjects()).resolves.toHaveLength(1)
  expect(apiRequest).toHaveBeenCalledWith('/api/projects')
  expect((await listPortfolioProjects())[0]).toMatchObject({
    id: 'p1', name: 'Project', description: { en: 'Description', fr: 'Description' },
    links: [{ type: 'liveProduct', url: 'https://example.test' }], number: '01',
  })
})

it('sends authenticated project mutations and encodes identifiers', async () => {
  const body = { title: 'Project' }
  await createProject(body, 'token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/projects', { method: 'POST', body, token: 'token' })
  await updateProject('id/1', body, 'token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/projects/id%2F1', { method: 'PUT', body, token: 'token' })
  await deleteProject('id/1', 'token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/projects/id%2F1', { method: 'DELETE', token: 'token' })
})

it('propagates loading errors', async () => {
  const error = new Error('Offline')
  apiRequest.mockRejectedValue(error)
  await expect(listPortfolioProjects()).rejects.toBe(error)
})
