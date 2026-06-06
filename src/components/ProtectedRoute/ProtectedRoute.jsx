import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  const ROLE_LEVELS = {
    Patron: 150,
    Business: 250,
    Distributor: 500,
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />
  }
  if (
    allowedRoles &&
    !allowedRoles.some(role => ROLE_LEVELS[role] === user.authorizationLevel)
  ) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute
