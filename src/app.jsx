import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login               from './pages/Login'
import Register            from './pages/Register'
import Dashboard           from './pages/Dashboard'
import Analytics           from './pages/Analytics'
import MultiTenant         from './pages/MultiTenant'
import CustomerManagement  from './pages/CustomerManagement'
import ChatbotAssistant    from './pages/ChatbotAssistant'
import AIInsights          from './pages/AIInsights'
import Personalization     from './pages/Personalization'
import Collaboration       from './pages/Collaboration'
import ReviewsRatings      from './pages/ReviewsRatings'
import ModuleManager       from './pages/ModuleManager'
import Accessibility       from './pages/Accessibility'
import ProtectedRoute      from './components/ProtectedRoute'
import DataUpload          from './pages/DataUpload'
import AdvancedKPIDashboard from './pages/AdvancedKPIDashboard'
import PredictiveAnalytics from './pages/PredictiveAnalytics'
import AICopilot           from './pages/AICopilot'
import WorkflowAutomation  from './pages/WorkflowAutomation'
import ExecutiveReporting  from './pages/ExecutiveReporting'
import IntegrationEcosystem from './pages/IntegrationEcosystem'

function App() {
  const { user } = useAuth()

  return (
    <Routes>

      {/* ── Public ────────────────────────────────────────── */}
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* ── Core Pages ────────────────────────────────────── */}
      <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/analytics"  element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/tenants"    element={<ProtectedRoute><MultiTenant /></ProtectedRoute>} />
      <Route path="/customers"  element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
      <Route path="/chatbot"    element={<ProtectedRoute><ChatbotAssistant /></ProtectedRoute>} />

      {/* ── Feature Pages ─────────────────────────────────── */}
      <Route path="/ai-insights"    element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
      <Route path="/personalization" element={<ProtectedRoute><Personalization /></ProtectedRoute>} />
      <Route path="/collaboration"  element={<ProtectedRoute><Collaboration /></ProtectedRoute>} />
      <Route path="/reviews"        element={<ProtectedRoute><ReviewsRatings /></ProtectedRoute>} />
      <Route path="/modules"        element={<ProtectedRoute><ModuleManager /></ProtectedRoute>} />
      <Route path="/accessibility"  element={<ProtectedRoute><Accessibility /></ProtectedRoute>} />

      {/* ── Tool Pages ────────────────────────────────────── */}
      <Route path="/upload-data"          element={<ProtectedRoute><DataUpload /></ProtectedRoute>} />
      <Route path="/kpi-dashboard"        element={<ProtectedRoute><AdvancedKPIDashboard /></ProtectedRoute>} />
      <Route path="/predictive-analytics" element={<ProtectedRoute><PredictiveAnalytics /></ProtectedRoute>} />
      <Route path="/ai-copilot"           element={<ProtectedRoute><AICopilot /></ProtectedRoute>} />
      <Route path="/workflow-automation"  element={<ProtectedRoute><WorkflowAutomation /></ProtectedRoute>} />
      <Route path="/executive-reporting"    element={<ProtectedRoute><ExecutiveReporting /></ProtectedRoute>} />
      <Route path="/integration-ecosystem" element={<ProtectedRoute><IntegrationEcosystem /></ProtectedRoute>} />

      {/* ── Default ───────────────────────────────────────── */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

      {/* ── 404 — MUST BE LAST ────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default App
