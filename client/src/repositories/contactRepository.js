import { apiRequest } from './apiClient.js'

export function createContact(values) {
  return apiRequest('/api/contacts', { method: 'POST', body: values })
}

export function listContacts(token) {
  return apiRequest('/api/contacts', { token })
}

export function createContactRecord(values, token) {
  return apiRequest('/api/contacts', { method: 'POST', body: values, token })
}

export function updateContact(id, values, token) {
  return apiRequest(`/api/contacts/${encodeURIComponent(id)}`, { method: 'PUT', body: values, token })
}

export function deleteContact(id, token) {
  return apiRequest(`/api/contacts/${encodeURIComponent(id)}`, { method: 'DELETE', token })
}
