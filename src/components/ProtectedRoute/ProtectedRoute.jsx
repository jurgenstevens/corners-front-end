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
  console.log('Allowed Roles:', allowedRoles)
  console.log('User level:', user.authorizationLevel)

  if (
    allowedRoles &&
    !allowedRoles.some(role => ROLE_LEVELS[role] === user.authorizationLevel)
  ) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute
