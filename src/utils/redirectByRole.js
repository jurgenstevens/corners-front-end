const AUTH_LEVEL_TO_ROUTE = {
  100: '/dashboard/patron',
  250: '/dashboard/business',
  500: '/dashboard/distributor',
}

export function redirectByRole(user, navigate) {
  if (!user || user.authorizationLevel == null) return

  const route = AUTH_LEVEL_TO_ROUTE[user.authorizationLevel]

  if (!route) {
    console.warn('Unknown authorizationLevel:', user.authorizationLevel)
    navigate('/')
    return
  }

  navigate(route)
}
