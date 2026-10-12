import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import config from '../config/config.js'
import { connectDatabase } from '../server/db/connect.js'
import app from '../server/express.js'
import Contact from '../server/models/contact.model.js'
import Project from '../server/models/project.model.js'
import Qualification from '../server/models/qualification.model.js'
import User from '../server/models/user.model.js'

const createdIds = { contacts: [], projects: [], qualifications: [], users: [] }
let server

async function request(method, path, { body, token } = {}) {
  const response = await fetch(`${server.baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = response.status === 204 ? null : await response.json()
  console.info(`${method} ${path} -> ${response.status}`)
  return { status: response.status, data }
}

async function expectStatus(method, path, status, options) {
  const response = await request(method, path, options)
  assert.equal(response.status, status, `${method} ${path} returned an unexpected status`)
  return response.data
}

async function testCollection(resource, body, adminToken, fieldToUpdate) {
  const created = await expectStatus('POST', `/api/${resource}`, 201, { body, token: adminToken })
  assert.ok(created._id, `${resource} create response should contain an id`)
  if (resource === 'users') assert.equal('passwordHash' in created, false, 'user responses must not expose password hashes')
  createdIds[resource].push(created._id)

  const list = await expectStatus('GET', `/api/${resource}`, 200, { token: adminToken })
  assert.ok(list.some((record) => record._id === created._id), `${resource} list should include the created record`)

  const item = await expectStatus('GET', `/api/${resource}/${created._id}`, 200, { token: adminToken })
  assert.equal(item._id, created._id)
  if (resource === 'users') assert.equal('passwordHash' in item, false, 'user read must not expose password hashes')

  const updatedValue = resource === 'contacts' ? 'updated@example.test' : `Updated ${String(body[fieldToUpdate] || body.title || 'record')}`
  const updated = await expectStatus('PUT', `/api/${resource}/${created._id}`, 200, {
    body: { [fieldToUpdate]: updatedValue },
    token: adminToken,
  })
  if (resource === 'contacts') assert.equal(updated.email, updatedValue)
  if (resource === 'users') assert.equal('passwordHash' in updated, false, 'user update must not expose password hashes')

  await expectStatus('DELETE', `/api/${resource}/${created._id}`, 204, { token: adminToken })
  createdIds[resource] = createdIds[resource].filter((id) => id !== created._id)
  await expectStatus('GET', `/api/${resource}/${created._id}`, 404, { token: adminToken })
}

async function runApiTests() {
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error('Set a local JWT_SECRET of at least 32 characters before running API tests.')
  }
  await connectDatabase()
  const listener = await new Promise((resolve) => {
    const testServer = app.listen(0, '127.0.0.1', () => resolve(testServer))
  })
  server = { listener, baseUrl: `http://127.0.0.1:${listener.address().port}` }

  const adminPassword = randomBytes(24).toString('base64url')
  const admin = await new User({
    name: 'Temporary API Test Admin',
    email: `api-test-admin-${Date.now()}@example.test`,
    password: adminPassword,
    role: 'admin',
  }).save()
  createdIds.users.push(admin._id)
  const adminSignIn = await expectStatus('POST', '/api/auth/signin', 200, {
    body: { email: admin.email, password: adminPassword },
  })
  assert.equal('passwordHash' in adminSignIn.user, false, 'sign-in response must not expose password hashes')
  const adminToken = adminSignIn.token

  await expectStatus('GET', '/', 200)
  await expectStatus('GET', '/api/health', 200)
  await expectStatus('GET', '/api/projects', 200)
  await expectStatus('GET', '/api/qualifications', 200)

  const regularUserCredentials = {
    name: 'Temporary API Test User',
    email: `api-test-user-${Date.now()}@example.test`,
    password: randomBytes(24).toString('base64url'),
    role: 'admin',
  }
  const regularUserResponse = await expectStatus('POST', '/api/auth/signup', 201, { body: regularUserCredentials })
  assert.equal(regularUserResponse.user.role, 'user', 'public sign-up must not allow role escalation')
  assert.equal('passwordHash' in regularUserResponse.user, false, 'sign-up response must not expose password hashes')
  createdIds.users.push(regularUserResponse.user._id)
  const persistedSignupUser = await User.findById(regularUserResponse.user._id).select('+passwordHash')
  assert.match(persistedSignupUser.passwordHash, /^\$2[aby]\$/, 'stored passwords must use bcrypt hashes')
  assert.notEqual(persistedSignupUser.passwordHash, regularUserCredentials.password)
  const regularSignIn = await expectStatus('POST', '/api/auth/signin', 200, {
    body: { email: regularUserCredentials.email, password: regularUserCredentials.password },
  })
  const regularToken = regularSignIn.token

  await expectStatus('GET', '/api/contacts', 401)
  await expectStatus('GET', '/api/users', 403, { token: regularToken })
  await expectStatus('POST', '/api/projects', 401, { body: { title: 'Unauthorized', description: 'Should be blocked' } })
  await expectStatus('POST', '/api/projects', 403, { body: { title: 'Forbidden', description: 'Should be blocked' }, token: regularToken })

  await testCollection('contacts', {
    firstName: 'API',
    lastName: 'Test',
    email: 'api-test@example.test',
    phone: '+16135550100',
    message: 'Temporary API integration test contact.',
  }, adminToken, 'email')

  const projectSlug = `api-test-${Date.now()}`
  await testCollection('projects', {
    slug: projectSlug,
    title: 'Temporary API Test Project',
    completionDate: '2026',
    description: 'Temporary project record for CRUD verification.',
    descriptionFr: 'Projet temporaire de test CRUD.',
    stack: ['Node.js'],
  }, adminToken, 'title')

  const qualificationSlug = `api-test-${Date.now()}`
  await testCollection('qualifications', {
    slug: qualificationSlug,
    title: 'Temporary API Test Qualification',
    titleFr: 'Qualification temporaire de test',
    completionDate: '2026',
    description: 'Temporary qualification record for CRUD verification.',
    descriptionFr: 'Qualification temporaire pour valider le CRUD.',
  }, adminToken, 'title')

  const userEmail = `api-test-managed-${Date.now()}@example.test`
  await testCollection('users', {
    name: 'Temporary Managed User',
    email: userEmail,
    password: randomBytes(24).toString('base64url'),
  }, adminToken, 'name')

  await expectStatus('POST', '/api/projects', 400, {
    body: { title: '', completionDate: 'bad', description: '' },
    token: adminToken,
  })
  await expectStatus('POST', '/api/qualifications', 401, {
    body: { title: 'Unauthorized qualification', completionDate: '2026', description: 'Should be blocked.' },
  })
  await expectStatus('POST', '/api/auth/signout', 200, { token: adminToken })

  console.info('All API integration checks passed.')
}

try {
  await runApiTests()
} catch (error) {
  console.error(`API integration tests failed: ${error.message}`)
  process.exitCode = 1
} finally {
  if (createdIds.contacts.length) await Contact.deleteMany({ _id: { $in: createdIds.contacts } })
  if (createdIds.projects.length) await Project.deleteMany({ _id: { $in: createdIds.projects } })
  if (createdIds.qualifications.length) await Qualification.deleteMany({ _id: { $in: createdIds.qualifications } })
  if (createdIds.users.length) await User.deleteMany({ _id: { $in: createdIds.users } })
  if (server?.listener) await new Promise((resolve, reject) => server.listener.close((error) => error ? reject(error) : resolve()))
  await mongoose.disconnect()
}