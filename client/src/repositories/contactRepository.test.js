import { beforeEach, expect, it, vi } from 'vitest'
import { apiRequest } from './apiClient.js'
import { createContact, createContactRecord, deleteContact, listContacts, updateContact } from './contactRepository.js'

vi.mock('./apiClient.js', () => ({ apiRequest: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

it('sends public and administrator contact requests with the correct payload and token', async () => {
  const body = { firstName: 'Alex', message: 'Hello' }
  await createContact(body)
  expect(apiRequest).toHaveBeenLastCalledWith('/api/contacts', { method: 'POST', body })
  await createContactRecord(body, 'token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/contacts', { method: 'POST', body, token: 'token' })
  await listContacts('token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/contacts', { token: 'token' })
  await updateContact('id/1', body, 'token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/contacts/id%2F1', { method: 'PUT', body, token: 'token' })
  await deleteContact('id/1', 'token')
  expect(apiRequest).toHaveBeenLastCalledWith('/api/contacts/id%2F1', { method: 'DELETE', token: 'token' })
})

it('propagates failures to the contact form', async () => {
  const error = new Error('Unavailable')
  apiRequest.mockRejectedValue(error)
  await expect(createContact({ message: 'Hello' })).rejects.toBe(error)
})
