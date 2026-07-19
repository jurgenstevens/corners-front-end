import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'

// pages
import Signup from './pages/Signup/Signup'
import Login from './pages/Login/Login'
import Landing from './pages/Landing/Landing'
import Profiles from './pages/Profiles/Profiles'
import PatronDashboard from './pages/Dashboards/PatronDashboard'
import BusinessDashboard from './pages/Dashboards/BusinessDashboard'
import DistributorDashboard from './pages/Dashboards/DistributorDashboard'
import JoinBusiness from './pages/Public/JoinBusiness'
import ChangePassword from './pages/ChangePassword/ChangePassword'
// business pages
import BusinessProducts from './pages/BusinessUIs/Products/BusinessProducts'
import BusinessPromotions from './pages/BusinessUIs/Promotions/BusinessPromotions'
import BusinessInventory from './pages/BusinessUIs/Inventory/BusinessInventory'
import BusinessAnalytics from './pages/BusinessUIs/Analytics/BusinessAnalytics'
import BusinessSettings from './pages/BusinessUIs/Settings/BusinessSettings'
import BusinessPatronRequests from './pages/BusinessUIs/PatronRequests/BusinessPatronRequests'
import BusinessSetup from './pages/BusinessUIs/Setup/BusinessSetup'
import BusinessPendingApproval from './pages/BusinessUIs/PendingApproval/BusinessPendingApproval'
import BusinessRejected from './pages/BusinessUIs/Rejected/BusinessRejected'
import BusinessDistributors from './pages/BusinessUIs/Distributors/BusinessDistributors'
import BusinessDistributorCatalog from './pages/BusinessUIs/Distributors/BusinessDistributorCatalog'
import BusinessDistributorOrders from './pages/BusinessUIs/Distributors/BusinessDistributorOrders'
// patron pages
import PatronStoreDetail from './pages/PatronUIs/Stores/PatronStoreDetail'
import PatronPendingApproval from './pages/PatronUIs/Stores/PatronPendingApproval'
import PatronProducts from './pages/PatronUIs/Products/PatronProducts'
import PatronRequests from './pages/PatronUIs/Requests/PatronRequests'
import PatronPromotions from './pages/PatronUIs/Promotions/PatronPromotions'
import PatronSettings from './pages/PatronUIs/Settings/PatronSettings'

// distributor pages
import DistributorOrders from './pages/DistributorUIs/DistributorOrders'
import DistributorCatalog from './pages/DistributorUIs/DistributorCatalog'
import DistributorSettings from './pages/DistributorUIs/DistributorSettings'

// admin
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminOverview from './pages/Admin/AdminOverview'
import AdminPatrons from './pages/Admin/AdminPatrons'
import AdminPatronDetail from './pages/Admin/AdminPatronDetail'
import AdminStores from './pages/Admin/AdminStores'
import AdminBusinessDetail from './pages/Admin/AdminBusinessDetail'
import AdminProducts from './pages/Admin/AdminProducts'
import AdminProductDetail from './pages/Admin/AdminProductDetail'
import AdminDistribution from './pages/Admin/AdminDistribution'
import AdminBugReports from './pages/Admin/AdminBugReports'
import AdminAnalytics from './pages/Admin/AdminAnalytics'
import AdminSettings from './pages/Admin/AdminSettings'

// layout + components
import DashboardLayout from './components/DashboardLayout/DashboardLayout'
import NavBar from './components/NavBar/NavBar'
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import IdleWarningModal from './components/IdleWarningModal/IdleWarningModal'

// hooks
import useIdleTimeout from './hooks/useIdleTimeout'

// services
import * as authService from './services/authService'

// styles
import './App.css'

function AdminGuard({ user, children }) {
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.authorizationLevel !== 100) return <Navigate to="/" replace />
  return children
}

const PATRON_NAV = [
  { to: '/dashboard/patron',            label: 'Home',        icon: '🏠', end: true },
  { to: '/dashboard/patron/products',   label: 'Products',    icon: '🛍️'            },
  { to: '/dashboard/patron/requests',   label: 'My Requests', icon: '📋'            },
  { to: '/dashboard/patron/promotions', label: 'Promotions',  icon: '🏷️'            },
  { to: '/dashboard/patron/settings',   label: 'Settings',    icon: '⚙️'            },
]

const BUSINESS_NAV = [
  { to: '/dashboard/business',                  label: 'Home',         icon: '🏠', end: true },
  { to: '/dashboard/business/products',         label: 'Products',     icon: '📦'            },
  { to: '/dashboard/business/inventory',        label: 'Inventory',    icon: '🗂️'            },
  { to: '/dashboard/business/promotions',       label: 'Promotions',   icon: '🏷️'            },
  { to: '/dashboard/business/patron-requests',  label: 'Patrons',      icon: '👥'            },
  // { to: '/dashboard/business/distributors', label: 'Distributors', icon: '🚚' },  // Hidden until distributor launch
  { to: '/dashboard/business/analytics',        label: 'Analytics',    icon: '📊'            },
  { to: '/dashboard/business/settings',         label: 'Settings',     icon: '⚙️'            },
]

const DISTRIBUTOR_NAV = [
  { to: '/dashboard/distributor',          label: 'Home',     icon: '🏠', end: true },
  { to: '/dashboard/distributor/orders',   label: 'Orders',   icon: '📦'            },
  { to: '/dashboard/distributor/catalog',  label: 'Catalog',  icon: '📋'            },
  { to: '/dashboard/distributor/settings', label: 'Settings', icon: '⚙️'            },
]

function getDashboard(user) {
  if (!user) return '/'
  if (user.authorizationLevel >= 500) return '/dashboard/distributor'
  if (user.authorizationLevel >= 250) return '/dashboard/business'
  return '/dashboard/patron'
}

function App() {
  const [user, setUser] = useState(authService.getUser())
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/dashboard/admin') || location.pathname.startsWith('/admin/login')

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    navigate('/')
  }

  const handleAuthEvt = (u) => { setUser(u) }

  const isBusiness = user?.authorizationLevel >= 250
  const idleTimeoutMs = !user ? Infinity : isBusiness ? 30 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
  const idleWarningMs = !user ? 60 * 1000  : isBusiness ? 2 * 60 * 1000  : 5 * 60 * 1000

  const { showWarning, secondsLeft, resetTimer } = useIdleTimeout({
    timeoutMs: idleTimeoutMs,
    warningMs: idleWarningMs,
    onLogout:  handleLogout,
  })

  useEffect(() => { setUser(authService.getUser()) }, [])

  return (
    <>
      {!isAdminPath && <NavBar user={user} handleLogout={handleLogout} />}
      <Routes>
        {/* Admin — standalone, no auth guard, dark login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Public */}
        <Route path="/" element={user ? <Navigate to={getDashboard(user)} replace /> : <Landing />} />
        <Route path="/join/:slug" element={<JoinBusiness />} />
        <Route path="/auth/signup" element={<Signup handleAuthEvt={handleAuthEvt} />} />
        <Route path="/auth/login"  element={<Login  handleAuthEvt={handleAuthEvt} />} />
        <Route path="/auth/change-password" element={<ProtectedRoute user={user}><ChangePassword handleAuthEvt={handleAuthEvt} /></ProtectedRoute>} />
        <Route path="/profiles" element={<ProtectedRoute user={user}><Profiles /></ProtectedRoute>} />

        {/* ── Patron (nested under /dashboard/patron) ── */}
        <Route
          path="/dashboard/patron"
          element={
            <ProtectedRoute user={user}>
              <DashboardLayout
                Dashboard={PatronDashboard}
                user={user}
                homePath="/dashboard/patron"
                navItems={PATRON_NAV}
              />
            </ProtectedRoute>
          }
        >
          <Route path="stores/pending/:businessId"   element={<PatronPendingApproval user={user} />} />
          <Route path="stores/:id"                   element={<PatronStoreDetail user={user} />} />
          <Route path="products"                     element={<PatronProducts user={user} />} />
          <Route path="requests"                     element={<PatronRequests user={user} />} />
          <Route path="promotions"                   element={<PatronPromotions user={user} />} />
          <Route path="settings"                     element={<PatronSettings user={user} />} />
        </Route>

        {/* Business standalone status pages (no DashboardLayout chrome) */}
        <Route path="/dashboard/business/pending-approval" element={<ProtectedRoute user={user}><BusinessPendingApproval /></ProtectedRoute>} />
        <Route path="/dashboard/business/rejected" element={<ProtectedRoute user={user}><BusinessRejected /></ProtectedRoute>} />

        {/* ── Business (nested under /dashboard/business) ── */}
        <Route
          path="/dashboard/business"
          element={
            <ProtectedRoute user={user}>
              <DashboardLayout
                Dashboard={BusinessDashboard}
                user={user}
                homePath="/dashboard/business"
                navItems={BUSINESS_NAV}
              />
            </ProtectedRoute>
          }
        >
          <Route path="setup"            element={<BusinessSetup user={user} />} />
          <Route path="products"         element={<BusinessProducts />} />
          <Route path="promotions"       element={<BusinessPromotions />} />
          <Route path="inventory"        element={<BusinessInventory />} />
          <Route path="analytics"        element={<BusinessAnalytics />} />
          <Route path="settings"         element={<BusinessSettings />} />
          <Route path="patron-requests"  element={<BusinessPatronRequests />} />
          <Route path="distributors"                    element={<BusinessDistributors />} />
          <Route path="distributors/orders"             element={<BusinessDistributorOrders />} />
          <Route path="distributors/:distributorId"     element={<BusinessDistributorCatalog />} />
        </Route>

        {/* ── Distributor ── */}
        <Route
          path="/dashboard/distributor"
          element={
            <ProtectedRoute user={user}>
              <DashboardLayout
                Dashboard={DistributorDashboard}
                user={user}
                homePath="/dashboard/distributor"
                navItems={DISTRIBUTOR_NAV}
              />
            </ProtectedRoute>
          }
        >
          <Route path="orders"   element={<DistributorOrders />} />
          <Route path="catalog"  element={<DistributorCatalog />} />
          <Route path="settings" element={<DistributorSettings />} />
        </Route>
        {/* ── Admin dashboard (nested under /dashboard/admin) ── */}
        <Route
          path="/dashboard/admin"
          element={
            <AdminGuard user={user}>
              <AdminDashboard user={user} />
            </AdminGuard>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="patrons" element={<AdminPatrons />} />
          <Route path="patrons/:id" element={<AdminPatronDetail />} />
          <Route path="stores" element={<AdminStores />} />
          <Route path="stores/:id" element={<AdminBusinessDetail />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:id" element={<AdminProductDetail />} />
          <Route path="distribution" element={<AdminDistribution />} />
          <Route path="bug-reports" element={<AdminBugReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings user={user} />} />
        </Route>
      </Routes>
      {!isAdminPath && <MobileBottomNav user={user} />}
      <IdleWarningModal
        showWarning={showWarning}
        secondsLeft={secondsLeft}
        resetTimer={resetTimer}
        onLogout={handleLogout}
      />
    </>
  )
}

export default App