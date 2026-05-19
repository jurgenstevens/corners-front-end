import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'

// pages
import Signup from './pages/Signup/Signup'
import Login from './pages/Login/Login'
import Landing from './pages/Landing/Landing'
import Profiles from './pages/Profiles/Profiles'
import PatronDashboard from './pages/Dashboards/PatronDashboard'
import BusinessDashboard from './pages/Dashboards/BusinessDashboard'
import DistributorDashboard from './pages/Dashboards/DistributorDashboard'
import ChangePassword from './pages/ChangePassword/ChangePassword'
// business pages
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

// components
import NavBar from './components/NavBar/NavBar'
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import SidePanel from './components/SidePanel/SidePanel'

// services
import * as authService from './services/authService'

// styles
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

  const handleAuthEvt = (user) => { setUser(user) }

  useEffect(() => { setUser(authService.getUser()) }, [])

  return (
    <>
      <NavBar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={user ? <Navigate to={getDashboard(user)} replace /> : <Landing />} />
        <Route path="/profiles" element={<ProtectedRoute user={user}><Profiles /></ProtectedRoute>} />
        <Route path="/auth/signup" element={<Signup handleAuthEvt={handleAuthEvt} />} />
        <Route path="/auth/login" element={<Login handleAuthEvt={handleAuthEvt} />} />
        <Route path="/auth/change-password" element={<ProtectedRoute user={user}><ChangePassword handleAuthEvt={handleAuthEvt} /></ProtectedRoute>} />

        {/* Patron routes */}
        <Route path="/dashboard/patron" element={<ProtectedRoute user={user}><PatronDashboard user={user} /></ProtectedRoute>} />
        <Route path="/patron/stores" element={
          <ProtectedRoute user={user}>
            <SidePanel><PatronMyStores user={user} /></SidePanel>
          </ProtectedRoute>
        } />
        <Route path="/patron/stores/pending/:businessId" element={<ProtectedRoute user={user}><PatronPendingApproval user={user} /></ProtectedRoute>} />
        <Route path="/patron/stores/:id" element={<ProtectedRoute user={user}><PatronStoreDetail user={user} /></ProtectedRoute>} />
        <Route path="/patron/products" element={
          <ProtectedRoute user={user}>
            <SidePanel><PatronProducts user={user} /></SidePanel>
          </ProtectedRoute>
        } />
        <Route path="/patron/requests" element={
          <ProtectedRoute user={user}>
            <SidePanel><PatronRequests user={user} /></SidePanel>
          </ProtectedRoute>
        } />
        <Route path="/patron/promotions" element={
          <ProtectedRoute user={user}>
            <SidePanel><PatronPromotions user={user} /></SidePanel>
          </ProtectedRoute>
        } />

        {/* Business routes */}
        <Route path="/dashboard/business" element={<ProtectedRoute user={user}><BusinessDashboard user={user} /></ProtectedRoute>} />
        <Route path="/dashboard/business/setup" element={<ProtectedRoute user={user}><BusinessSetup user={user} /></ProtectedRoute>} />
        <Route path="/dashboard/business/products" element={<ProtectedRoute user={user}><BusinessProducts /></ProtectedRoute>} />
        <Route path="/dashboard/business/promotions" element={<ProtectedRoute user={user}><BusinessPromotions /></ProtectedRoute>} />
        <Route path="/dashboard/business/inventory" element={<ProtectedRoute user={user}><BusinessInventory /></ProtectedRoute>} />
        <Route path="/dashboard/business/analytics" element={<ProtectedRoute user={user}><BusinessAnalytics /></ProtectedRoute>} />
        <Route path="/dashboard/business/settings" element={<ProtectedRoute user={user}><BusinessSettings /></ProtectedRoute>} />
        <Route path="/dashboard/business/patron-requests" element={<ProtectedRoute user={user}><BusinessPatronRequests /></ProtectedRoute>} />

        {/* Distributor */}
        <Route path="/dashboard/distributor" element={<ProtectedRoute user={user}><DistributorDashboard /></ProtectedRoute>} />
      </Routes>
      <MobileBottomNav user={user} />
    </>
  )
}

export default App
