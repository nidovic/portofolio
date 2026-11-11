const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, { status = null, details = [], code = 'api' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.code = code
  }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('The API could not be reached.', { code: 'network' })
  }

  if (response.status === 204) return null
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(result.error || `API request failed with status ${response.status}.`, {
      status: response.status,
      details: result.details || [],
    })
  }
  return result
}
