import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'

import Signup from './pages/Signup/Signup'
import Login from './pages/Login/Login'
import Landing from './pages/Landing/Landing'
import Profiles from './pages/Profiles/Profiles'
import PatronDashboard from './pages/Dashboards/PatronDashboard'
import BusinessDashboard from './pages/Dashboards/BusinessDashboard'
import DistributorDashboard from './pages/Dashboards/DistributorDashboard'
import ChangePassword from './pages/ChangePassword/ChangePassword'
import BusinessProducts from './pages/BusinessUIs/Products/BusinessProducts'
import BusinessPromotions from './pages/BusinessUIs/Promotions/BusinessPromotions'
import BusinessInventory from './pages/BusinessUIs/Inventory/BusinessInventory'
import BusinessAnalytics from './pages/BusinessUIs/Analytics/BusinessAnalytics'
import BusinessSettings from './pages/BusinessUIs/Settings/BusinessSettings'
import BusinessPatronRequests from './pages/BusinessUIs/PatronRequests/BusinessPatronRequests'
import BusinessSetup from './pages/BusinessUIs/Setup/BusinessSetup'
// patron pages
import PatronMyStores from './pages/PatronUIs/Stores/PatronMyStores'
import PatronStoreDetail from './pages/PatronUIs/Stores/PatronStoreDetail'
import PatronPendingApproval from './pages/PatronUIs/Stores/PatronPendingApproval'
import PatronProducts from './pages/PatronUIs/Products/PatronProducts'
import PatronRequests from './pages/PatronUIs/Requests/PatronRequests'
import PatronPromotions from './pages/PatronUIs/Promotions/PatronPromotions'

// layout + components
import DashboardLayout from './components/DashboardLayout/DashboardLayout'
import NavBar from './components/NavBar/NavBar'
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

import * as authService from './services/authService'
import './App.css'

function getDashboard(user) {
  if (!user) return '/'
  if (user.authorizationLevel >= 500) return '/dashboard/distributor'
  if (user.authorizationLevel >= 250) return '/dashboard/business'
  return '/dashboard/patron'
}

function App() {
  const [user, setUser] = useState(authService.getUser())
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    navigate('/')
  }

  const handleAuthEvt = (u) => { setUser(u) }

  useEffect(() => { setUser(authService.getUser()) }, [])

  return (
    <>
      <NavBar user={user} handleLogout={handleLogout} />
      <Routes>
        {/* Public */}
        <Route path="/" element={user ? <Navigate to={getDashboard(user)} replace /> : <Landing />} />
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
              />
            </ProtectedRoute>
          }
        >
          <Route path="stores"                       element={<PatronMyStores user={user} />} />
          <Route path="stores/pending/:businessId"   element={<PatronPendingApproval user={user} />} />
          <Route path="stores/:id"                   element={<PatronStoreDetail user={user} />} />
          <Route path="products"                     element={<PatronProducts user={user} />} />
          <Route path="requests"                     element={<PatronRequests user={user} />} />
          <Route path="promotions"                   element={<PatronPromotions user={user} />} />
        </Route>

        {/* ── Business (nested under /dashboard/business) ── */}
        <Route
          path="/dashboard/business"
          element={
            <ProtectedRoute user={user}>
              <DashboardLayout
                Dashboard={BusinessDashboard}
                user={user}
                homePath="/dashboard/business"
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
        </Route>

        {/* Distributor */}
        <Route path="/dashboard/distributor" element={<ProtectedRoute user={user}><DistributorDashboard /></ProtectedRoute>} />
      </Routes>
      <MobileBottomNav user={user} />
    </>
  )
}

export default App