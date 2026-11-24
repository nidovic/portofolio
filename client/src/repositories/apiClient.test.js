import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, ApiError } from './apiClient.js'
import { signIn, signOut, signUp, getCurrentUser } from './authRepository.js'
import { createContact, createContactRecord, deleteContact, listContacts, updateContact } from './contactRepository.js'
import { createProject, deleteProject, listPortfolioProjects, updateProject } from './projectRepository.js'
import { createQualification, deleteQualification, listPortfolioQualifications, updateQualification } from './qualificationRepository.js'
import { listUsers, updateUserRole } from './userRepository.js'
import { formatPeriod, localizedPeriod } from '@/lib/period.js'
import { getLocale, localizedText } from '@/lib/localized.js'

afterEach(() => vi.unstubAllGlobals())

function mockResponse(body, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(body),
  }))
}

describe('API client', () => {
  it('sends JSON and an authorization header', async () => {
    mockResponse({ ok: true })
    await expect(apiRequest('/api/test', { method: 'POST', body: { name: 'Test' }, token: 'token' })).resolves.toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/test'), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
    }))
  })

  it('returns null for a no-content response', async () => {
    mockResponse(null, 204)
    await expect(apiRequest('/api/test')).resolves.toBeNull()
  })

  it('reports server status and details and handles non-JSON errors', async () => {
    mockResponse({ error: 'Bad request', details: [{ field: 'name' }] }, 400)
    await expect(apiRequest('/api/test')).rejects.toMatchObject({ name: 'ApiError', status: 400, message: 'Bad request', details: [{ field: 'name' }] })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 502, ok: false, json: () => Promise.reject(new Error('invalid JSON')) }))
    await expect(apiRequest('/api/test')).rejects.toMatchObject({ status: 502, message: 'API request failed with status 502.' })
  })

  it('distinguishes aborted requests from network failures', async () => {
    const abort = new DOMException('Aborted', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(abort).mockRejectedValueOnce(new Error('offline')))
    await expect(apiRequest('/api/test')).rejects.toBe(abort)
    await expect(apiRequest('/api/test')).rejects.toMatchObject({ code: 'network', message: 'The API could not be reached.' })
    expect(new ApiError('error')).toMatchObject({ status: null, details: [], code: 'api' })
  })
})

describe('resource repositories', () => {
  it('sends auth and CRUD operations to their correct endpoints', async () => {
    mockResponse({ ok: true })
    const calls = [
      [() => signIn({ email: 'a' }), '/api/auth/signin', 'POST'],
      [() => signUp({ name: 'a' }), '/api/auth/signup', 'POST'],
      [() => signOut('t'), '/api/auth/signout', 'POST'],
      [() => getCurrentUser('t'), '/api/auth/me', 'GET'],
      [() => createContact({ message: 'hello' }), '/api/contacts', 'POST'],
      [() => createContactRecord({ message: 'hello' }, 't'), '/api/contacts', 'POST'],
      [() => listContacts('t'), '/api/contacts', 'GET'],
      [() => updateContact('a/b', {}, 't'), '/api/contacts/a%2Fb', 'PUT'],
      [() => deleteContact('a/b', 't'), '/api/contacts/a%2Fb', 'DELETE'],
      [() => createProject({}, 't'), '/api/projects', 'POST'],
      [() => updateProject('a/b', {}, 't'), '/api/projects/a%2Fb', 'PUT'],
      [() => deleteProject('a/b', 't'), '/api/projects/a%2Fb', 'DELETE'],
      [() => createQualification({}, 't'), '/api/qualifications', 'POST'],
      [() => updateQualification('a/b', {}, 't'), '/api/qualifications/a%2Fb', 'PUT'],
      [() => deleteQualification('a/b', 't'), '/api/qualifications/a%2Fb', 'DELETE'],
      [() => listUsers('t'), '/api/users', 'GET'],
      [() => updateUserRole('a/b', 'admin', 't'), '/api/users/a%2Fb', 'PUT'],
    ]
    for (const [call, url, method] of calls) {
      await call()
      expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining(url), expect.objectContaining({ method }))
    }
    expect(JSON.parse(fetch.mock.lastCall[1].body)).toEqual({ role: 'admin' })
  })

  it('maps project and qualification API records into localized portfolio values', async () => {
    mockResponse([{ _id: 'p1', title: 'Project', description: 'Description', sourceUrl: 'https://example.com' }])
    const [project] = await listPortfolioProjects()
    expect(project).toMatchObject({ id: 'p1', name: 'Project', category: { en: 'Project', fr: 'Projet' }, links: [{ type: 'liveProduct', url: 'https://example.com' }], number: '01' })
    mockResponse([{ slug: 'course', title: 'Degree', titleFr: 'Diplôme', description: 'Details', location: 'Toronto' }])
    const [qualification] = await listPortfolioQualifications()
    expect(qualification).toMatchObject({ id: 'course', title: { en: 'Degree', fr: 'Diplôme' }, location: { en: 'Toronto', fr: 'Toronto' } })
  })

  it('preserves translated details and explicitly configured project links', async () => {
    mockResponse([{
      slug: 'localized', title: 'Project', category: 'Mobile', categoryFr: 'Mobile FR',
      description: 'English', descriptionFr: 'Français', role: 'Developer', roleFr: 'Développeur',
      outcome: 'Shipped', outcomeFr: 'Livré', image: '/project.png', imageAlt: 'Image',
      imageAltFr: 'Illustration', imageKind: 'logo', stack: ['React'],
      links: [{ type: 'github', url: 'https://example.test' }],
    }])
    const [project] = await listPortfolioProjects()
    expect(project).toMatchObject({
      id: 'localized', category: { en: 'Mobile', fr: 'Mobile FR' },
      description: { en: 'English', fr: 'Français' }, role: { en: 'Developer', fr: 'Développeur' },
      outcome: { en: 'Shipped', fr: 'Livré' }, imageKind: 'logo',
      imageAlt: { en: 'Image', fr: 'Illustration' }, links: [{ type: 'github', url: 'https://example.test' }],
    })
    mockResponse([{ _id: 'p2', title: 'No links', description: 'Description' }])
    expect((await listPortfolioProjects())[0].links).toEqual([])
  })
})

describe('localized values', () => {
  it('uses the requested language and falls back safely', () => {
    expect(getLocale('fr-CA')).toBe('fr')
    expect(getLocale()).toBe('en')
    expect(localizedText('same', 'fr')).toBe('same')
    expect(localizedText({ en: 'hello', fr: 'bonjour' }, 'fr-CA')).toBe('bonjour')
    expect(localizedText({ en: 'hello' }, 'fr')).toBe('hello')
    expect(localizedText(null, 'en')).toBe('')
  })

  it('formats complete, open-ended, and legacy periods', () => {
    expect(formatPeriod({ completionDate: '2021–2026' }, 'en')).toBe('2021–2026')
    expect(formatPeriod({}, 'fr')).toBe('')
    expect(formatPeriod({ startDate: '2024-01-02', endDate: '2024-03-05' }, 'en')).toBe('Jan 2, 2024 – Mar 5, 2024')
    expect(localizedPeriod({ startDate: '2024-01-02' })).toEqual({ en: 'Started: Jan 2, 2024', fr: 'Début : 2 janv. 2024' })
  })
})
