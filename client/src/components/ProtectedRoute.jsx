import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/useAuth.js'
import { ROUTES } from '@/constants/routes.js'

function ProtectedRoute({ children }) {
  const { isAuthenticated, signedOut } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    if (signedOut) return <Navigate to={ROUTES.signIn} replace />
    return <Navigate to={ROUTES.unauthorized} replace state={{ from: location }} />
  }
  return children
}

export default ProtectedRoute
