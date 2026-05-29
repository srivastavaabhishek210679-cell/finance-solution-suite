import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login                from './pages/Login'
import Register             from './pages/Register'
import ForgotPassword       from './pages/ForgotPassword'
import ResetPassword        from './pages/ResetPassword'
import Onboarding           from './pages/Onboarding'
import Dashboard            from './pages/Dashboard'
import Analytics            from './pages/Analytics'
import MultiTenant          from './pages/MultiTenant'
import CustomerManagement   from './pages/CustomerManagement'
import ChatbotAssistant     from './pages/ChatbotAssistant'
import AIInsights           from './pages/AIInsights'
import Personalization      from './pages/Personalization'
import Collaboration        from './pages/Collaboration'
import ReviewsRatings       from './pages/ReviewsRatings'
import ModuleManager        from './pages/ModuleManager'
import Accessibility        from './pages/Accessibility'
import ProtectedRoute       from './components/ProtectedRoute'
import PayrollManagement from './pages/PayrollManagement'
import DataUpload           from './pages/DataUpload'
import AdvancedKPIDashboard from './pages/AdvancedKPIDashboard'
import PredictiveAnalytics  from './pages/PredictiveAnalytics'
import AICopilot            from './pages/AICopilot'
import WorkflowAutomation   from './pages/WorkflowAutomation'
import ExecutiveReporting   from './pages/ExecutiveReporting'
import IntegrationEcosystem from './pages/IntegrationEcosystem'
import Monetization         from './pages/Monetization'
import ErrorBoundary        from './components/ErrorBoundary'

function Protected({ children, pageName }) {
  return (
    <ProtectedRoute>
      <ErrorBoundary pageName={pageName}>
        {children}
      </ErrorBoundary>
    </ProtectedRoute>
  )
}

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login"           element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register"        element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
      <Route path="/reset-password"  element={user ? <Navigate to="/dashboard" replace /> : <ResetPassword />} />

      <Route path="/onboarding" element={
        <ProtectedRoute>
          <ErrorBoundary pageName="Onboarding"><Onboarding /></ErrorBoundary>
        </ProtectedRoute>
      } />

      <Route path="/dashboard"             element={<Protected pageName="Dashboard">            <Dashboard />            </Protected>} />
      <Route path="/analytics"             element={<Protected pageName="Analytics">            <Analytics />            </Protected>} />
      <Route path="/tenants"               element={<Protected pageName="Multi-Tenant">         <MultiTenant />          </Protected>} />
      <Route path="/customers"             element={<Protected pageName="Customer Management">  <CustomerManagement />   </Protected>} />
      <Route path="/chatbot"               element={<Protected pageName="AI Assistant">         <ChatbotAssistant />     </Protected>} />
      <Route path="/ai-insights"           element={<Protected pageName="AI Insights">          <AIInsights />           </Protected>} />
      <Route path="/personalization"       element={<Protected pageName="Personalization">      <Personalization />      </Protected>} />
      <Route path="/collaboration"         element={<Protected pageName="Collaboration">        <Collaboration />        </Protected>} />
      <Route path="/reviews"               element={<Protected pageName="Reviews">              <ReviewsRatings />       </Protected>} />
      <Route path="/modules"               element={<Protected pageName="Module Manager">       <ModuleManager />        </Protected>} />
      <Route path="/accessibility"         element={<Protected pageName="Accessibility">        <Accessibility />        </Protected>} />
      <Route path="/payroll" element={<Protected pageName="Payroll Management"><PayrollManagement /></Protected>} />
      <Route path="/upload-data"           element={<Protected pageName="Data Upload">          <DataUpload />           </Protected>} />
      <Route path="/kpi-dashboard"         element={<Protected pageName="KPI Dashboard">        <AdvancedKPIDashboard /> </Protected>} />
      <Route path="/predictive-analytics"  element={<Protected pageName="Predictive AI">        <PredictiveAnalytics />  </Protected>} />
      <Route path="/ai-copilot"            element={<Protected pageName="AI Copilot">           <AICopilot />            </Protected>} />
      <Route path="/workflow-automation"   element={<Protected pageName="Workflow Automation">   <WorkflowAutomation />   </Protected>} />
      <Route path="/executive-reporting"   element={<Protected pageName="Executive Reporting">   <ExecutiveReporting />   </Protected>} />
      <Route path="/integration-ecosystem" element={<Protected pageName="Integration Ecosystem"> <IntegrationEcosystem /> </Protected>} />
      <Route path="/monetization"          element={<Protected pageName="Billing & Plans">      <Monetization />         </Protected>} />

      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App

