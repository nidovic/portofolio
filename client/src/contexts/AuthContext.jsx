import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContext.js'
import { getCurrentUser, signIn as signInRequest, signOut as signOutRequest, signUp as signUpRequest } from '@/repositories/authRepository.js'

const TOKEN_KEY = 'portfolio-access-token'

function readSession() {
  const token = window.sessionStorage.getItem(TOKEN_KEY)
  try {
    return { token, user: JSON.parse(window.sessionStorage.getItem('portfolio-user') || 'null') }
  } catch {
    window.sessionStorage.removeItem(TOKEN_KEY)
    window.sessionStorage.removeItem('portfolio-user')
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  const saveSession = useCallback((result) => {
    const nextSession = { token: result.token, user: result.user }
    window.sessionStorage.setItem(TOKEN_KEY, result.token)
    window.sessionStorage.setItem('portfolio-user', JSON.stringify(result.user))
    setSession(nextSession)
    return nextSession
  }, [])

  const signIn = useCallback(async (credentials) => {
    return saveSession(await signInRequest(credentials))
  }, [saveSession])

  const signUp = useCallback(async (credentials) => {
    return saveSession(await signUpRequest(credentials))
  }, [saveSession])

  const signOut = useCallback(async () => {
    window.sessionStorage.removeItem(TOKEN_KEY)
    window.sessionStorage.removeItem('portfolio-user')
    setSession({ token: null, user: null, signedOut: true })
    if (session.token) await signOutRequest(session.token)
  }, [session.token])

  const refreshUser = useCallback(async () => {
    const token = session.token
    try {
      const user = await getCurrentUser(token)
      if (window.sessionStorage.getItem(TOKEN_KEY) === token) {
        saveSession({ token, user })
      }
      return user
    } catch (error) {
      if (error.status === 401 && window.sessionStorage.getItem(TOKEN_KEY) === token) {
        window.sessionStorage.removeItem(TOKEN_KEY)
        window.sessionStorage.removeItem('portfolio-user')
        setSession({ token: null, user: null })
      }
      throw error
    }
  }, [saveSession, session.token])

  const acknowledgeSignOut = useCallback(() => {
    setSession((current) => current.signedOut ? { ...current, signedOut: false } : current)
  }, [])

  const value = useMemo(() => ({
    ...session,
    isAuthenticated: Boolean(session.token && session.user),
    isAdmin: session.user?.role === 'admin',
    signIn,
    signUp,
    signOut,
    refreshUser,
    acknowledgeSignOut,
  }), [session, signIn, signOut, signUp, refreshUser, acknowledgeSignOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
