import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage from './pages/AdminLoginPage'
import PaymentPage from './pages/PaymentPage'
import RulesPage from './pages/RulesPage'
import FAQPage from './pages/FAQPage'
import BlogPage from './pages/BlogPage'
import WhatsAppButton from './components/WhatsAppButton'

function AppLayout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const isDashboard = location.pathname.startsWith('/dashboard')
  const showNavbar = !isAdmin && !isDashboard

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/payment/:plan" element={<PaymentPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/blog/:slug" element={<BlogPage />} />
      </Routes>
      {showNavbar && <WhatsAppButton />}
    </>
  )
}

export default AppLayout
