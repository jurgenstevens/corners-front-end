export function redirectByRole(user, navigate) {
  if (!user || !user.role) return

  const role = user.role.toLowerCase()

  switch (role) {
    case 'Patron':
      navigate('/dashboard/patron')
      break

    case 'Business':
      navigate('/dashboard/business')
      break

    case 'Distributor':
      navigate('/dashboard/distributor')
      break

    default:
      console.warn('Unknown role:', role)
      navigate('/')
  }
}
