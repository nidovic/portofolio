import { apiRequest } from './apiClient.js'

export function listUsers(token) {
  return apiRequest('/api/users', { token })
}

export function updateUserRole(id, role, token) {
  return apiRequest(`/api/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: { role },
    token,
  })
}
