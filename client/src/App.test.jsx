import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext.jsx'
import i18n from '@/i18n.js'
import App from './App.jsx'

const userRecord = { _id: 'user-1', name: 'Test User', role: 'user' }
const adminRecord = { _id: 'admin-1', name: 'Test Admin', role: 'admin' }

function response(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data }
}

function openApp(path) {
  return render(<MemoryRouter initialEntries={[path]}><AuthProvider><App /></AuthProvider></MemoryRouter>)
}

function setSession(user) {
  sessionStorage.setItem('portfolio-access-token', 'test-token')
  sessionStorage.setItem('portfolio-user', JSON.stringify(user))
}

beforeEach(async () => {
  sessionStorage.clear()
  localStorage.clear()
  await i18n.changeLanguage('en')
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('fetch', vi.fn(async () => response([])))
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('portfolio navigation and public content', () => {
  it('navigates to projects and reports an empty API result', async () => {
    const user = userEvent.setup()
    openApp('/')
    await user.click(screen.getByRole('link', { name: /explore my work/i }))
    expect(await screen.findByText('No projects have been added yet.')).toBeTruthy()
    expect(document.title).toContain('Projects')
  })

  it('shows a project from the API and its external link', async () => {
    fetch.mockResolvedValue(response([{ _id: 'p1', title: 'API project', description: 'Useful app', stack: ['React'], sourceUrl: 'https://example.test' }]))
    openApp('/projects')
    expect(await screen.findByRole('heading', { name: 'API project' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /visit project/i }).getAttribute('href')).toBe('https://example.test')
  })

  it('shows fallback content and a visible error when projects cannot load', async () => {
    fetch.mockRejectedValue(new Error('offline'))
    openApp('/projects')
    expect(await screen.findByText(/Could not load projects from the API/)).toBeTruthy()
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0)
  })

  it('shows qualifications and handles an empty response', async () => {
    fetch.mockResolvedValue(response([{ _id: 'q1', title: 'Computer science', institution: 'College', description: 'Studies', location: 'Toronto' }]))
    const { unmount } = openApp('/education')
    expect(await screen.findByRole('heading', { name: 'Computer science' })).toBeTruthy()
    unmount()
    fetch.mockResolvedValue(response([]))
    openApp('/education')
    expect(await screen.findByText('No qualifications have been added yet.')).toBeTruthy()
  })

  it('displays saved qualifications when the API fails', async () => {
    fetch.mockRejectedValue(new Error('offline'))
    openApp('/education')
    expect(await screen.findByText(/Could not load qualifications from the API/)).toBeTruthy()
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0)
  })

  it('opens the about and contact pages through navigation', async () => {
    const user = userEvent.setup()
    openApp('/')
    await user.click(screen.getByRole('link', { name: 'About' }))
    expect(await screen.findByRole('link', { name: /Download résumé/ })).toBeTruthy()
    await user.click(screen.getByRole('link', { name: 'Contact' }))
    expect(await screen.findByRole('button', { name: 'Send message' })).toBeTruthy()
  })

  it('switches language, updates metadata and persists the preference', async () => {
    const user = userEvent.setup()
    openApp('/')
    await user.click(screen.getByRole('button', { name: 'FR' }))
    expect(screen.getByRole('link', { name: 'Accueil' })).toBeTruthy()
    expect(document.documentElement.lang).toBe('fr')
    expect(localStorage.getItem('portfolio-language')).toBe('fr')
  })

  it('opens the mobile navigation and closes it on navigation', async () => {
    const user = userEvent.setup()
    openApp('/')
    const menu = screen.getByRole('button', { name: 'Open navigation' })
    await user.click(menu)
    expect(menu.getAttribute('aria-expanded')).toBe('true')
    await user.click(screen.getByRole('link', { name: 'Services' }))
    expect(await screen.findByRole('heading', { name: /From mobile apps to production systems/ })).toBeTruthy()
    expect(menu.getAttribute('aria-expanded')).toBe('false')
  })

  it('redirects unauthenticated dashboard visitors to the sign-in prompt', async () => {
    openApp('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Sign in to continue.' })).toBeTruthy()
  })
})

describe('authentication and dashboard', () => {
  it('validates sign-up fields without sending a request', async () => {
    const user = userEvent.setup()
    openApp('/sign-up')
    await user.click(await screen.findByRole('button', { name: 'Sign up' }))
    expect(await screen.findAllByText('This field is required.')).toHaveLength(3)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows an incorrect-credentials error without storing a session', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValue(response({ error: 'Bad credentials' }, 401))
    openApp('/sign-in')
    await user.type(await screen.findByLabelText('Email address'), 'alex@example.test')
    await user.type(screen.getByLabelText('Password'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect((await screen.findByRole('alert')).textContent).toContain('That email and password do not match')
    expect(sessionStorage.getItem('portfolio-access-token')).toBeNull()
  })

  it.each([
    [400, 'Some of the information is not valid'],
    [409, 'An account with this email already exists'],
    [429, 'There have been too many attempts'],
    [500, 'The server had a problem completing your request'],
  ])('explains sign-in failure for HTTP %s', async (status, message) => {
    const user = userEvent.setup()
    fetch.mockResolvedValue(response({ error: 'Request failed', details: [{ field: 'email' }] }, status))
    openApp('/sign-in')
    await user.type(await screen.findByLabelText('Email address'), 'alex@example.test')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect((await screen.findByRole('alert')).textContent).toContain(message)
    if (status === 400) expect(screen.getByText('Enter a valid email address.')).toBeTruthy()
  })

  it('creates an account and stores the returned session', async () => {
    const user = userEvent.setup()
    fetch.mockImplementation(async (url) => {
      if (url.endsWith('/api/auth/signup')) return response({ token: 'test-token', user: userRecord }, 201)
      if (url.endsWith('/api/auth/me')) return response(userRecord)
      return response([])
    })
    openApp('/sign-up')
    await user.type(await screen.findByLabelText('Name'), 'Alex Example')
    await user.type(screen.getByLabelText('Email address'), 'alex@example.test')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(await screen.findByText(/Only administrators can create/)).toBeTruthy()
    expect(sessionStorage.getItem('portfolio-access-token')).toBe('test-token')
  })

  it('signs in, loads read-only records and signs out', async () => {
    const user = userEvent.setup()
    fetch.mockImplementation(async (url) => {
      if (url.endsWith('/api/auth/signin')) return response({ token: 'test-token', user: userRecord })
      if (url.endsWith('/api/auth/me')) return response(userRecord)
      return response([])
    })
    openApp('/sign-in')
    await user.type(await screen.findByLabelText('Email address'), 'alex@example.test')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText(/Only administrators can create, edit, or delete/)).toBeTruthy()
    expect(sessionStorage.getItem('portfolio-access-token')).toBe('test-token')
    expect(screen.queryByRole('button', { name: 'Create' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('heading', { name: 'Sign in to your account.' })).toBeTruthy()
    expect(sessionStorage.getItem('portfolio-access-token')).toBeNull()
  })

  it('clears malformed stored sessions', async () => {
    sessionStorage.setItem('portfolio-access-token', 'test-token')
    sessionStorage.setItem('portfolio-user', '{invalid')
    openApp('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Sign in to continue.' })).toBeTruthy()
    expect(sessionStorage.getItem('portfolio-access-token')).toBeNull()
  })

  it('lets an administrator promote another user after confirmation', async () => {
    const user = userEvent.setup()
    setSession(adminRecord)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fetch.mockImplementation(async (url) => {
      if (url.endsWith('/api/auth/me')) return response(adminRecord)
      if (url.endsWith('/api/users/user-1')) return response({ ...userRecord, email: 'alex@example.test', role: 'admin' })
      if (url.endsWith('/api/users')) return response([{ ...userRecord, email: 'alex@example.test' }])
      return response([])
    })
    openApp('/dashboard')
    const promote = await screen.findByRole('button', { name: 'Make administrator' })
    await user.click(promote)
    expect(await screen.findByText(/Test User is now an administrator/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Remove administrator access' })).toBeTruthy()
    const users = screen.getByRole('heading', { name: 'Users' }).closest('section')
    expect(within(users).getByText('alex@example.test')).toBeTruthy()
  })

  it('lets an administrator remove another administrator’s access', async () => {
    const user = userEvent.setup()
    setSession(adminRecord)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fetch.mockImplementation(async (url) => {
      if (url.endsWith('/api/auth/me')) return response(adminRecord)
      if (url.endsWith('/api/users/user-1')) return response({ ...userRecord, email: 'alex@example.test', role: 'user' })
      if (url.endsWith('/api/users')) return response([{ ...userRecord, email: 'alex@example.test', role: 'admin', createdAt: '2024-01-01' }])
      return response([])
    })
    openApp('/dashboard')
    await user.click(await screen.findByRole('button', { name: 'Remove administrator access' }))
    expect(await screen.findByText(/Administrator access removed from Test User/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Make administrator' })).toBeTruthy()
  })

  it('creates, edits and deletes a contact through the administrator dashboard', async () => {
    const user = userEvent.setup()
    const contacts = []
    setSession(adminRecord)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fetch.mockImplementation(async (url, options) => {
      if (url.endsWith('/api/auth/me')) return response(adminRecord)
      if (url.endsWith('/api/contacts') && options.method === 'POST') {
        contacts.push({ _id: 'contact-1', ...JSON.parse(options.body) })
        return response(contacts[0], 201)
      }
      if (url.endsWith('/api/contacts/contact-1') && options.method === 'PUT') {
        Object.assign(contacts[0], JSON.parse(options.body))
        return response(contacts[0])
      }
      if (url.endsWith('/api/contacts/contact-1') && options.method === 'DELETE') {
        contacts.pop()
        return response(null, 204)
      }
      if (url.endsWith('/api/contacts')) return response([...contacts])
      return response([])
    })
    openApp('/dashboard')
    const heading = await screen.findByRole('heading', { name: 'Contact submissions' })
    const section = within(heading.closest('section'))
    await user.type(section.getByLabelText(/First name/), 'Alex')
    await user.type(section.getByLabelText(/Last name/), 'Tester')
    await user.type(section.getByLabelText(/Email/), 'alex@example.test')
    await user.type(section.getByLabelText(/Phone/), '+14165550123')
    await user.type(section.getByLabelText(/Message/), 'Hello')
    await user.click(section.getByRole('button', { name: 'Create' }))
    expect(await section.findByText('Alex Tester')).toBeTruthy()
    await user.click(section.getByRole('button', { name: 'Edit' }))
    await user.clear(section.getByLabelText(/First name/))
    await user.type(section.getByLabelText(/First name/), 'Sam')
    await user.click(section.getByRole('button', { name: 'Save changes' }))
    expect(await section.findByText('Sam Tester')).toBeTruthy()
    await user.click(section.getByRole('button', { name: 'Delete' }))
    expect(await section.findByText('Record deleted.')).toBeTruthy()
    expect(contacts).toHaveLength(0)
  })

  it('reports role verification failure and clears an expired session', async () => {
    setSession(adminRecord)
    fetch.mockImplementation(async (url) => url.endsWith('/api/auth/me')
      ? response({ error: 'Expired' }, 401)
      : response([]))
    openApp('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Sign in to continue.' })).toBeTruthy()
    expect(sessionStorage.getItem('portfolio-access-token')).toBeNull()
  })

  it('reports a sign-out request failure but still removes the local session', async () => {
    const user = userEvent.setup()
    setSession(userRecord)
    fetch.mockImplementation(async (url) => url.endsWith('/api/auth/signout')
      ? Promise.reject(new Error('offline'))
      : response([]))
    openApp('/')
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(await screen.findByText(/server could not confirm the request/)).toBeTruthy()
    expect(sessionStorage.getItem('portfolio-access-token')).toBeNull()
  })

  it('displays an access-check failure rather than granting edit rights', async () => {
    setSession(adminRecord)
    fetch.mockImplementation(async (url) => url.endsWith('/api/auth/me')
      ? response({ error: 'Unavailable' }, 503)
      : response([]))
    openApp('/dashboard')
    expect(await screen.findByText(/Could not verify your access/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Create' })).toBeNull()
  })

  it('reports record loading failures', async () => {
    setSession(userRecord)
    fetch.mockImplementation(async (url) => {
      if (url.endsWith('/api/auth/me')) return response(userRecord)
      if (url.endsWith('/api/contacts')) return response({ error: 'Records unavailable' }, 503)
      return response([])
    })
    openApp('/dashboard')
    expect(await screen.findByText('Records unavailable')).toBeTruthy()
  })

  it('cancels a role change and reports permission errors', async () => {
    const user = userEvent.setup()
    setSession(adminRecord)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValue(true)
    fetch.mockImplementation(async (url) => {
      if (url.endsWith('/api/auth/me')) return response(adminRecord)
      if (url.endsWith('/api/users/user-1')) return response({ error: 'Forbidden' }, 403)
      if (url.endsWith('/api/users')) return response([{ ...userRecord, email: 'alex@example.test' }])
      return response([])
    })
    openApp('/dashboard')
    const promote = await screen.findByRole('button', { name: 'Make administrator' })
    await user.click(promote)
    expect(fetch.mock.calls.some(([url]) => url.endsWith('/api/users/user-1'))).toBe(false)
    await user.click(promote)
    expect(await screen.findByText(/Your administrator access has changed/)).toBeTruthy()
    expect(confirm).toHaveBeenCalledTimes(2)
  })

  it('edits a legacy project with typed links and a new date range', async () => {
    const user = userEvent.setup()
    const project = {
      _id: 'p1', slug: 'legacy', title: 'Legacy project', description: 'Earlier project',
      completionDate: '2021', sourceUrl: 'https://example.test', stack: ['React'],
    }
    setSession(adminRecord)
    fetch.mockImplementation(async (url, options) => {
      if (url.endsWith('/api/auth/me')) return response(adminRecord)
      if (url.endsWith('/api/projects/p1') && options.method === 'PUT') {
        Object.assign(project, JSON.parse(options.body))
        return response(project)
      }
      if (url.endsWith('/api/projects')) return response([{ ...project }])
      return response([])
    })
    openApp('/dashboard')
    const heading = await screen.findByRole('heading', { name: 'Projects' })
    const section = within(heading.closest('section'))
    await section.findByText('Legacy project')
    await user.click(section.getByRole('button', { name: 'Edit' }))
    expect(section.getByText(/Previously saved period: 2021/)).toBeTruthy()
    fireEvent.change(section.getByLabelText(/Start date/), { target: { value: '2024-01-02' } })
    fireEvent.change(section.getByLabelText(/End date/), { target: { value: '2024-03-05' } })
    await user.click(section.getByRole('button', { name: 'Add a link' }))
    const types = section.getAllByLabelText('Link type')
    await user.selectOptions(types[1], 'github')
    const urls = section.getAllByLabelText('URL')
    await user.type(urls[1], 'https://github.com/example/project')
    await user.click(section.getByRole('button', { name: 'Save changes' }))
    expect(await section.findByText('Record saved.')).toBeTruthy()
    expect(project.stack).toEqual(['React'])
    expect(project.links).toEqual([
      { type: 'liveProduct', url: 'https://example.test' },
      { type: 'github', url: 'https://github.com/example/project' },
    ])
    expect(project.startDate).toBe('2024-01-02')
  })

  it('does not delete a record when confirmation is cancelled and reports save errors', async () => {
    const user = userEvent.setup()
    setSession(adminRecord)
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    fetch.mockImplementation(async (url, options) => {
      if (url.endsWith('/api/auth/me')) return response(adminRecord)
      if (url.endsWith('/api/contacts/c1') && options.method === 'PUT') return response({ error: 'Could not save' }, 500)
      if (url.endsWith('/api/contacts')) return response([{ _id: 'c1', firstName: 'Alex', lastName: 'Tester', email: 'alex@example.test', phone: '123456789', message: 'Hello' }])
      return response([])
    })
    openApp('/dashboard')
    const heading = await screen.findByRole('heading', { name: 'Contact submissions' })
    const section = within(heading.closest('section'))
    await section.findByText('Alex Tester')
    await user.click(section.getByRole('button', { name: 'Delete' }))
    expect(fetch.mock.calls.some(([, options]) => options.method === 'DELETE')).toBe(false)
    await user.click(section.getByRole('button', { name: 'Edit' }))
    await user.click(section.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('Could not save')).toBeTruthy()
    await user.click(section.getByRole('button', { name: 'Cancel' }))
    expect(section.getByRole('button', { name: 'Create' })).toBeTruthy()
  })

  it('validates project dates and creates a project after correcting them', async () => {
    const user = userEvent.setup()
    let created
    setSession(adminRecord)
    fetch.mockImplementation(async (url, options) => {
      if (url.endsWith('/api/auth/me')) return response(adminRecord)
      if (url.endsWith('/api/projects') && options.method === 'POST') {
        created = JSON.parse(options.body)
        return response({ _id: 'p2', ...created }, 201)
      }
      return response([])
    })
    openApp('/dashboard')
    const heading = await screen.findByRole('heading', { name: 'Projects' })
    const section = within(heading.closest('section'))
    await user.type(section.getByLabelText(/Slug/), 'new-project')
    await user.type(section.getByLabelText(/Title \(English\)/), 'New project')
    await user.type(section.getByLabelText(/Description \(English\)/), 'Useful work')
    await user.type(section.getByLabelText(/Technology stack/), 'React, Node.js, ')
    fireEvent.change(section.getByLabelText(/Start date/), { target: { value: '2024-02-01' } })
    fireEvent.change(section.getByLabelText(/End date/), { target: { value: '2024-01-01' } })
    fireEvent.submit(section.getByRole('button', { name: 'Create' }).closest('form'))
    expect(await screen.findByText(/end date that is not earlier/)).toBeTruthy()
    expect(created).toBeUndefined()
    fireEvent.change(section.getByLabelText(/End date/), { target: { value: '2024-03-01' } })
    await user.click(section.getByRole('button', { name: 'Add a link' }))
    await user.click(section.getByRole('button', { name: 'Remove' }))
    await user.click(section.getByRole('button', { name: 'Create' }))
    expect(await section.findByText('Record saved.')).toBeTruthy()
    expect(created.stack).toEqual(['React', 'Node.js'])
    expect(created.links).toEqual([])
    expect(created.imageKind).toBeUndefined()
  })

  it('renders invalid legacy links as text and reports user-list errors', async () => {
    setSession(adminRecord)
    fetch.mockImplementation(async (url) => {
      if (url.endsWith('/api/auth/me')) return response(adminRecord)
      if (url.endsWith('/api/users')) return response({ error: 'Users unavailable' }, 503)
      if (url.endsWith('/api/projects')) return response([{ _id: 'p1', title: 'Legacy', links: [{ type: 'github', url: 'javascript:unsafe' }], startDate: '2024-01-01', endDate: '2024-02-01' }])
      return response([])
    })
    openApp('/dashboard')
    expect(await screen.findByText(/Could not load users/)).toBeTruthy()
    const legacy = await screen.findByText(/javascript:unsafe/)
    expect(within(legacy.closest('li')).queryByRole('link')).toBeNull()
  })

  it('explains a network failure during sign-up', async () => {
    const user = userEvent.setup()
    fetch.mockRejectedValue(new Error('offline'))
    openApp('/sign-up')
    await user.type(await screen.findByLabelText('Name'), 'Alex Example')
    await user.type(screen.getByLabelText('Email address'), 'alex@example.test')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))
    expect((await screen.findByRole('alert')).textContent).toContain('could not connect to the portfolio server')
  })

  it('reports an unexpected sign-up failure', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValue(response({ error: 'Unexpected' }, 418))
    openApp('/sign-up')
    await user.type(await screen.findByLabelText('Name'), 'Alex Example')
    await user.type(screen.getByLabelText('Email address'), 'alex@example.test')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Please check your information and try again')
  })

  it('reports a failed deletion and keeps the record visible', async () => {
    const user = userEvent.setup()
    setSession(adminRecord)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fetch.mockImplementation(async (url, options) => {
      if (url.endsWith('/api/auth/me')) return response(adminRecord)
      if (url.endsWith('/api/contacts/c1') && options.method === 'DELETE') return response({ error: 'Delete failed' }, 500)
      if (url.endsWith('/api/contacts')) return response([{ _id: 'c1', firstName: 'Alex', lastName: 'Tester' }])
      return response([])
    })
    openApp('/dashboard')
    const heading = await screen.findByRole('heading', { name: 'Contact submissions' })
    const section = within(heading.closest('section'))
    await section.findByText('Alex Tester')
    await user.click(section.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('Delete failed')).toBeTruthy()
    expect(section.getByText('Alex Tester')).toBeTruthy()
  })
})
