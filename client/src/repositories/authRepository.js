import { apiRequest } from './apiClient.js'

export function signUp(credentials) {
  return apiRequest('/api/auth/signup', { method: 'POST', body: credentials })
}

export function signIn(credentials) {
  return apiRequest('/api/auth/signin', { method: 'POST', body: credentials })
}

export function signOut(token) {
  return apiRequest('/api/auth/signout', { method: 'POST', token })
}

export function getCurrentUser(token) {
  return apiRequest('/api/auth/me', { token })
}
