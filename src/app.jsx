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
import ResourceManagement from './pages/ResourceManagement'
import ProjectManagement  from './pages/ProjectManagement'
import BudgetManagement  from './pages/BudgetManagement'
import LeaveManagement   from './pages/LeaveManagement'
import VendorManagement  from './pages/VendorManagement'
import AssetManagement   from './pages/AssetManagement'
import ContractManagement from './pages/ContractManagement'
import InventoryManagement  from './pages/InventoryManagement'
import DocumentManagement   from './pages/DocumentManagement'
import RiskManagement       from './pages/RiskManagement'
import ExpenseManagement    from './pages/ExpenseManagement'
import PerformanceManagement from './pages/PerformanceManagement'
import RecruitmentManagement from './pages/RecruitmentManagement'
import InvoiceManagement    from './pages/InvoiceManagement'
import TrainingManagement   from './pages/TrainingManagement'
import TravelManagement     from './pages/TravelManagement'
import AttendanceManagement from './pages/AttendanceManagement'
import SalesPipeline        from './pages/SalesPipeline'
import HelpdeskManagement   from './pages/HelpdeskManagement'
import ComplianceManagement from './pages/ComplianceManagement'
import WorkflowAutomation   from './pages/WorkflowAutomation'
import AICopilot            from './pages/AICopilot'
import PredictiveAnalytics  from './pages/PredictiveAnalytics'
import IntegrationEcosystem from './pages/IntegrationEcosystem'
import Monetization         from './pages/Monetization'
import ErrorBoundary        from './components/ErrorBoundary'
import AdvancedKPIDashboard from './pages/AdvancedKPIDashboard'
import DataUpload           from './pages/DataUpload'
import MFASettings          from './pages/MFASettings'
import ExecutiveReporting   from './pages/ExecutiveReporting'

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
      <Route path="/ai-insights"           element={<Protected pageName="AI Insights">          <AIInsights />           </Protected>} />
      <Route path="/ai-copilot"            element={<Protected pageName="AI Copilot">           <AICopilot />            </Protected>} />
      <Route path="/predictive-analytics"  element={<Protected pageName="Predictive Analytics"> <PredictiveAnalytics />  </Protected>} />
      <Route path="/workflow-automation"   element={<Protected pageName="Workflow Automation">  <WorkflowAutomation />   </Protected>} />
      <Route path="/kpi-dashboard"         element={<Protected pageName="KPI Dashboard">        <AdvancedKPIDashboard /> </Protected>} />
      <Route path="/collaboration"         element={<Protected pageName="Collaboration">        <Collaboration />        </Protected>} />
      <Route path="/reviews"               element={<Protected pageName="Reviews">              <ReviewsRatings />       </Protected>} />
      <Route path="/modules"               element={<Protected pageName="Module Manager">       <ModuleManager />        </Protected>} />
      <Route path="/accessibility"         element={<Protected pageName="Accessibility">        <Accessibility />        </Protected>} />
      <Route path="/payroll" element={<Protected pageName="Payroll Management"><PayrollManagement /></Protected>} />
      <Route path="/resources-mgmt" element={<Protected pageName="Resource Management"><ResourceManagement /></Protected>} />
      <Route path="/resources-mgmt" element={<Protected pageName="Resource Management"><ResourceManagement /></Protected>} />
      <Route path="/project-mgmt" element={<Protected pageName="Project Management"><ProjectManagement /></Protected>} />
      <Route path="/project-mgmt" element={<Protected pageName="Project Management"><ProjectManagement /></Protected>} />
      <Route path="/budget-mgmt" element={<Protected pageName="Budget Management"><BudgetManagement /></Protected>} />
      <Route path="/leave-mgmt" element={<Protected pageName="Leave Management"><LeaveManagement /></Protected>} />
      <Route path="/vendor-mgmt" element={<Protected pageName="Vendor Management"><VendorManagement /></Protected>} />
      <Route path="/asset-mgmt" element={<Protected pageName="Asset Management"><AssetManagement /></Protected>} />
      <Route path="/contract-mgmt" element={<Protected pageName="Contract Management"><ContractManagement /></Protected>} />
      <Route path="/contract-mgmt" element={<Protected pageName="Contract Management"><ContractManagement /></Protected>} />
      <Route path="/inventory-mgmt" element={<Protected pageName="Inventory Management"><InventoryManagement /></Protected>} />
      <Route path="/crm-mgmt" element={<Protected pageName="Customer Management"><CustomerManagement /></Protected>} />
      <Route path="/document-mgmt" element={<Protected pageName="Document Management"><DocumentManagement /></Protected>} />
      <Route path="/risk-mgmt" element={<Protected pageName="Risk Management"><RiskManagement /></Protected>} />
      <Route path="/expense-mgmt" element={<Protected pageName="Expense Management"><ExpenseManagement /></Protected>} />
      <Route path="/performance-mgmt" element={<Protected pageName="Performance Management"><PerformanceManagement /></Protected>} />
      <Route path="/recruitment-mgmt" element={<Protected pageName="Recruitment Management"><RecruitmentManagement /></Protected>} />
      <Route path="/recruitment-mgmt" element={<Protected pageName="Recruitment Management"><RecruitmentManagement /></Protected>} />
      <Route path="/invoices" element={<Protected pageName="Invoice Management"><InvoiceManagement /></Protected>} />
      <Route path="/training" element={<Protected pageName="Training Management"><TrainingManagement /></Protected>} />
      <Route path="/travel" element={<Protected pageName="Travel Management"><TravelManagement /></Protected>} />
      <Route path="/attendance" element={<Protected pageName="Attendance Management"><AttendanceManagement /></Protected>} />
      <Route path="/sales-pipeline" element={<Protected pageName="Sales Pipeline"><SalesPipeline /></Protected>} />
      <Route path="/helpdesk" element={<Protected pageName="IT Helpdesk"><HelpdeskManagement /></Protected>} />
      <Route path="/compliance" element={<Protected pageName="Compliance Management"><ComplianceManagement /></Protected>} />
      <Route path="/compliance" element={<Protected pageName="Compliance Management"><ComplianceManagement /></Protected>} />
      <Route path="/upload-data" element={<Protected pageName="Data Upload"><DataUpload /></Protected>} />
      <Route path="/upload-data" element={<Protected pageName="Data Upload"><DataUpload /></Protected>} />
      <Route path="/mfa-settings" element={<Protected pageName="MFA Settings"><MFASettings /></Protected>} />
      <Route path="/mfa-settings" element={<Protected pageName="MFA Settings"><MFASettings /></Protected>} />
      <Route path="/personalization" element={<Protected pageName="Personalization"><Personalization /></Protected>} />
      <Route path="/integration-ecosystem" element={<Protected pageName="Integration Ecosystem"> <IntegrationEcosystem /> </Protected>} />
      <Route path="/monetization"          element={<Protected pageName="Billing & Plans">      <Monetization />         </Protected>} />

      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App

