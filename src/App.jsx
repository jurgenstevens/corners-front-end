import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'

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
import PatronProducts from './pages/PatronUIs/Products/PatronProducts'
import PatronRequests from './pages/PatronUIs/Requests/PatronRequests'

import NavBar from './components/NavBar/NavBar'
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

import * as authService from './services/authService'
import './App.css'

function App() {
  const [user, setUser] = useState(authService.getUser())
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    navigate('/')
  }

  const handleAuthEvt = (user) => setUser(user)

  useEffect(() => { setUser(authService.getUser()) }, [])

  return (
    <>
      <NavBar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Landing user={user} />} />
        <Route path="/profiles" element={<ProtectedRoute user={user}><Profiles /></ProtectedRoute>} />
        <Route path="/auth/signup" element={<Signup handleAuthEvt={handleAuthEvt} />} />
        <Route path="/auth/login" element={<Login handleAuthEvt={handleAuthEvt} />} />
        <Route path="/auth/change-password" element={<ProtectedRoute user={user}><ChangePassword handleAuthEvt={handleAuthEvt} /></ProtectedRoute>} />

        {/* Patron */}
        <Route path="/dashboard/patron" element={<ProtectedRoute user={user} allowedRoles={['Patron']}><PatronDashboard user={user} /></ProtectedRoute>} />
        <Route path="/patron/products" element={<ProtectedRoute user={user} allowedRoles={['Patron']}><PatronProducts /></ProtectedRoute>} />
        <Route path="/patron/requests" element={<ProtectedRoute user={user} allowedRoles={['Patron']}><PatronRequests /></ProtectedRoute>} />

        {/* Business */}
        <Route path="/dashboard/business" element={<ProtectedRoute user={user} allowedRoles={['Business']}><BusinessDashboard user={user} /></ProtectedRoute>} />
        <Route path="/dashboard/business/products" element={<ProtectedRoute user={user} allowedRoles={['Business']}><BusinessProducts /></ProtectedRoute>} />
        <Route path="/dashboard/business/promotions" element={<ProtectedRoute user={user} allowedRoles={['Business']}><BusinessPromotions /></ProtectedRoute>} />
        <Route path="/dashboard/business/inventory" element={<ProtectedRoute user={user} allowedRoles={['Business']}><BusinessInventory /></ProtectedRoute>} />
        <Route path="/dashboard/business/analytics" element={<ProtectedRoute user={user} allowedRoles={['Business']}><BusinessAnalytics /></ProtectedRoute>} />
        <Route path="/dashboard/business/settings" element={<ProtectedRoute user={user} allowedRoles={['Business']}><BusinessSettings /></ProtectedRoute>} />
        <Route path="/dashboard/business/patronRequests" element={<ProtectedRoute user={user} allowedRoles={['Business']}><BusinessPatronRequests /></ProtectedRoute>} />

        {/* Distributor */}
        <Route path="/dashboard/distributor" element={<ProtectedRoute user={user} allowedRoles={['Distributor']}><DistributorDashboard /></ProtectedRoute>} />
      </Routes>
      <MobileBottomNav user={user} />
    </>
  )
}

export default App