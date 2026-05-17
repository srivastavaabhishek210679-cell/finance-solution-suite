import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import MultiTenant from './pages/MultiTenant'
import CustomerManagement from './pages/CustomerManagement'
import ChatbotAssistant from './pages/ChatbotAssistant'
import AIInsights from './pages/AIInsights'
import Personalization from './pages/Personalization'
import Collaboration from './pages/Collaboration'
import ReviewsRatings from './pages/ReviewsRatings'
import ModuleManager from './pages/ModuleManager'
import Accessibility from './pages/Accessibility'
import ProtectedRoute from './components/ProtectedRoute'
import DataUpload from './pages/DataUpload';
import AdvancedKPIDashboard from './pages/AdvancedKPIDashboard';
import PredictiveAnalytics from './pages/PredictiveAnalytics'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Multi-Tenant & Customer Management */}
      <Route
        path="/tenants"
        element={
          <ProtectedRoute>
            <MultiTenant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomerManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <ChatbotAssistant />
          </ProtectedRoute>
        }
      />

      {/* NEW FEATURE PAGES - 6 Features */}
      <Route
        path="/ai-insights"
        element={
          <ProtectedRoute>
            <AIInsights />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personalization"
        element={
          <ProtectedRoute>
            <Personalization />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collaboration"
        element={
          <ProtectedRoute>
            <Collaboration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <ReviewsRatings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules"
        element={
          <ProtectedRoute>
            <ModuleManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accessibility"
        element={
          <ProtectedRoute>
            <Accessibility />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
	  <Route path="/upload-data" element={<DataUpload />} />
	  <Route path="/kpi-dashboard" element={<AdvancedKPIDashboard />} />
	  <Route path="/analytics" element={<Analytics />} />
	  <Route path="/predictive-analytics" element={<ProtectedRoute><PredictiveAnalytics /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
