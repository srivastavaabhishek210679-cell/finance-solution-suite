// Build: 2026-06-10 15:48:08
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'
import CookieBanner from './components/CookieBanner'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

const Login                = lazy(() => import('./pages/Login'))
const Register             = lazy(() => import('./pages/Register'))
const ForgotPassword       = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword        = lazy(() => import('./pages/ResetPassword'))
const Onboarding           = lazy(() => import('./pages/Onboarding'))
const Workspace            = lazy(() => import('./pages/Workspace'))
const Dashboard            = lazy(() => import('./pages/Dashboard'))
const Analytics            = lazy(() => import('./pages/Analytics'))
const MultiTenant          = lazy(() => import('./pages/MultiTenant'))
const CustomerManagement   = lazy(() => import('./pages/CustomerManagement'))
const ChatbotAssistant     = lazy(() => import('./pages/ChatbotAssistant'))
const AIInsights           = lazy(() => import('./pages/AIInsights'))
const AICopilot            = lazy(() => import('./pages/AICopilot'))
const PredictiveAnalytics  = lazy(() => import('./pages/PredictiveAnalytics'))
const WorkflowAutomation   = lazy(() => import('./pages/WorkflowAutomation'))
const ExecutiveReporting   = lazy(() => import('./pages/ExecutiveReporting'))
const Personalization      = lazy(() => import('./pages/Personalization'))
const Collaboration        = lazy(() => import('./pages/Collaboration'))
const ReviewsRatings       = lazy(() => import('./pages/ReviewsRatings'))
const ModuleManager        = lazy(() => import('./pages/ModuleManager'))
const Accessibility        = lazy(() => import('./pages/Accessibility'))
const Monetization         = lazy(() => import('./pages/Monetization'))
const IntegrationEcosystem = lazy(() => import('./pages/IntegrationEcosystem'))
const PayrollManagement    = lazy(() => import('./pages/PayrollManagement'))
const ResourceManagement   = lazy(() => import('./pages/ResourceManagement'))
const ProjectManagement    = lazy(() => import('./pages/ProjectManagement'))
const BudgetManagement     = lazy(() => import('./pages/BudgetManagement'))
const LeaveManagement      = lazy(() => import('./pages/LeaveManagement'))
const VendorManagement     = lazy(() => import('./pages/VendorManagement'))
const AssetManagement      = lazy(() => import('./pages/AssetManagement'))
const ContractManagement   = lazy(() => import('./pages/ContractManagement'))
const InventoryManagement  = lazy(() => import('./pages/InventoryManagement'))
const DocumentManagement   = lazy(() => import('./pages/DocumentManagement'))
const RiskManagement       = lazy(() => import('./pages/RiskManagement'))
const ExpenseManagement    = lazy(() => import('./pages/ExpenseManagement'))
const PerformanceManagement= lazy(() => import('./pages/PerformanceManagement'))
const RecruitmentManagement= lazy(() => import('./pages/RecruitmentManagement'))
const InvoiceManagement    = lazy(() => import('./pages/InvoiceManagement'))
const TrainingManagement   = lazy(() => import('./pages/TrainingManagement'))
const TravelManagement     = lazy(() => import('./pages/TravelManagement'))
const AttendanceManagement = lazy(() => import('./pages/AttendanceManagement'))
const SalesPipeline        = lazy(() => import('./pages/SalesPipeline'))
const HelpdeskManagement   = lazy(() => import('./pages/HelpdeskManagement'))
const ComplianceManagement = lazy(() => import('./pages/ComplianceManagement'))
const AdvancedKPIDashboard = lazy(() => import('./pages/AdvancedKPIDashboard'))
const DataUpload           = lazy(() => import('./pages/DataUpload'))
const MFASettings          = lazy(() => import('./pages/MFASettings'))
const VerifyEmail          = lazy(() => import('./pages/VerifyEmail'))
const AuditLog             = lazy(() => import('./pages/AuditLog'))
const GDPRPrivacyCenter    = lazy(() => import('./pages/GDPRPrivacyCenter'))
const ReportsDatabase      = lazy(() => import('./pages/ReportsDatabase'))
const FTPWatcher           = lazy(() => import('./pages/FTPWatcher'))
const InvoiceGenerator  = lazy(() => import('./pages/InvoiceGenerator'))
const POGenerator       = lazy(() => import('./pages/POGenerator'))
const Approvals         = lazy(() => import('./pages/Approvals'))
const WebhooksConfig    = lazy(() => import('./pages/WebhooksConfig'))
const RBACManager       = lazy(() => import('./pages/RBACManager'))
const CalendarScheduler = lazy(() => import('./pages/CalendarScheduler'))
const KPITargets        = lazy(() => import('./pages/KPITargets'))
const ScheduledReports  = lazy(() => import('./pages/ScheduledReports'))
const BulkImportExport  = lazy(() => import('./pages/BulkImportExport'))
const AdminPanel        = lazy(() => import('./pages/AdminPanel'))
const BusinessAnalytics  = lazy(() => import('./pages/BusinessAnalytics'))
const LiveDashboard     = lazy(() => import('./pages/LiveDashboard'))
const OrderManagement      = lazy(() => import('./pages/OrderManagement'))
const SupplyManagement     = lazy(() => import('./pages/SupplyManagement'))
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
    <>
      <Suspense fallback={<div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}><div style={{textAlign:'center'}}><div style={{width:40,height:40,border:'3px solid #334155',borderTop:'3px solid #10b981',borderRadius:'50%',margin:'0 auto 12px',animation:'spin 1s linear infinite'}}></div><p>Loading...</p></div></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={user ? <Navigate to="/workspace" replace /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/onboarding" element={<Protected pageName="Onboarding"><Onboarding /></Protected>} />
          <Route path="/workspace" element={<Protected pageName="My Workspace"><Workspace /></Protected>} />
          <Route path="/dashboard" element={<Protected pageName="Dashboard"><Dashboard /></Protected>} />
          <Route path="/analytics" element={<Protected pageName="Analytics"><Analytics /></Protected>} />
          <Route path="/multi-tenant" element={<Protected pageName="Multi Tenant"><MultiTenant /></Protected>} />
          <Route path="/tenants" element={<Protected pageName="Multi Tenant"><MultiTenant /></Protected>} />
          <Route path="/customers" element={<Protected pageName="Customer Management"><CustomerManagement /></Protected>} />
          <Route path="/customer-management" element={<Protected pageName="Customer Management"><CustomerManagement /></Protected>} />
          <Route path="/chatbot" element={<Protected pageName="AI Chatbot"><ChatbotAssistant /></Protected>} />
          <Route path="/ai-insights" element={<Protected pageName="AI Insights"><AIInsights /></Protected>} />
          <Route path="/ai-copilot" element={<Protected pageName="AI Copilot"><AICopilot /></Protected>} />
          <Route path="/predictive-analytics" element={<Protected pageName="Predictive Analytics"><PredictiveAnalytics /></Protected>} />
          <Route path="/workflow-automation" element={<Protected pageName="Workflow Automation"><WorkflowAutomation /></Protected>} />
          <Route path="/executive-reporting" element={<Protected pageName="Executive Reporting"><ExecutiveReporting /></Protected>} />
          <Route path="/personalization" element={<Protected pageName="Personalization"><Personalization /></Protected>} />
          <Route path="/collaboration" element={<Protected pageName="Collaboration"><Collaboration /></Protected>} />
          <Route path="/reviews" element={<Protected pageName="Reviews"><ReviewsRatings /></Protected>} />
          <Route path="/modules" element={<Protected pageName="Module Manager"><ModuleManager /></Protected>} />
          <Route path="/module-manager" element={<Protected pageName="Module Manager"><ModuleManager /></Protected>} />
          <Route path="/accessibility" element={<Protected pageName="Accessibility"><Accessibility /></Protected>} />
          <Route path="/monetization" element={<Protected pageName="Monetization"><Monetization /></Protected>} />
          <Route path="/integration-ecosystem" element={<Protected pageName="Integrations"><IntegrationEcosystem /></Protected>} />
          <Route path="/integrations" element={<Protected pageName="Integrations"><IntegrationEcosystem /></Protected>} />
          <Route path="/payroll" element={<Protected pageName="Payroll Management"><PayrollManagement /></Protected>} />
          <Route path="/resources-mgmt" element={<Protected pageName="Resource Management"><ResourceManagement /></Protected>} />
          <Route path="/project-mgmt" element={<Protected pageName="Project Management"><ProjectManagement /></Protected>} />
          <Route path="/budget-mgmt" element={<Protected pageName="Budget Management"><BudgetManagement /></Protected>} />
          <Route path="/leave-mgmt" element={<Protected pageName="Leave Management"><LeaveManagement /></Protected>} />
          <Route path="/vendor-mgmt" element={<Protected pageName="Vendor Management"><VendorManagement /></Protected>} />
          <Route path="/asset-mgmt" element={<Protected pageName="Asset Management"><AssetManagement /></Protected>} />
          <Route path="/contract-mgmt" element={<Protected pageName="Contract Management"><ContractManagement /></Protected>} />
          <Route path="/inventory-mgmt" element={<Protected pageName="Inventory Management"><InventoryManagement /></Protected>} />
          <Route path="/document-mgmt" element={<Protected pageName="Document Management"><DocumentManagement /></Protected>} />
          <Route path="/risk-mgmt" element={<Protected pageName="Risk Management"><RiskManagement /></Protected>} />
          <Route path="/expense-mgmt" element={<Protected pageName="Expense Management"><ExpenseManagement /></Protected>} />
          <Route path="/performance-mgmt" element={<Protected pageName="Performance Management"><PerformanceManagement /></Protected>} />
          <Route path="/recruitment-mgmt" element={<Protected pageName="Recruitment Management"><RecruitmentManagement /></Protected>} />
          <Route path="/invoices" element={<Protected pageName="Invoice Management"><InvoiceManagement /></Protected>} />
          <Route path="/training" element={<Protected pageName="Training Management"><TrainingManagement /></Protected>} />
          <Route path="/travel" element={<Protected pageName="Travel Management"><TravelManagement /></Protected>} />
          <Route path="/attendance" element={<Protected pageName="Attendance Management"><AttendanceManagement /></Protected>} />
          <Route path="/sales-pipeline" element={<Protected pageName="Sales Pipeline"><SalesPipeline /></Protected>} />
          <Route path="/helpdesk" element={<Protected pageName="IT Helpdesk"><HelpdeskManagement /></Protected>} />
          <Route path="/compliance" element={<Protected pageName="Compliance Management"><ComplianceManagement /></Protected>} />
          <Route path="/crm-mgmt" element={<Protected pageName="CRM"><CustomerManagement /></Protected>} />
          <Route path="/kpi-dashboard" element={<Protected pageName="KPI Dashboard"><AdvancedKPIDashboard /></Protected>} />
          <Route path="/upload-data" element={<Protected pageName="Data Upload"><DataUpload /></Protected>} />
          <Route path="/mfa-settings" element={<Protected pageName="MFA Settings"><MFASettings /></Protected>} />
          <Route path="/audit-log" element={<Protected pageName="Audit Log"><AuditLog /></Protected>} />
          <Route path="/privacy" element={<Protected pageName="Privacy Center"><GDPRPrivacyCenter /></Protected>} />
          <Route path="/reports-db" element={<Protected pageName="Reports Database"><ReportsDatabase /></Protected>} />
          <Route path="/reports-db" element={<Protected pageName="Reports Database"><ReportsDatabase /></Protected>} />
          <Route path="/ftp-watcher" element={<Protected pageName="FTP Watcher"><FTPWatcher /></Protected>} />
          <Route path="/invoice-gen" element={<Protected pageName="Invoice Generator"><InvoiceGenerator /></Protected>} />
          <Route path="/po-gen" element={<Protected pageName="PO Generator"><POGenerator /></Protected>} />
          <Route path="/approvals" element={<Protected pageName="Approvals"><Approvals /></Protected>} />
          <Route path="/webhooks" element={<Protected pageName="Webhooks"><WebhooksConfig /></Protected>} />
          <Route path="/rbac" element={<Protected pageName="RBAC"><RBACManager /></Protected>} />
          <Route path="/calendar" element={<Protected pageName="Calendar"><CalendarScheduler /></Protected>} />
          <Route path="/kpi-targets" element={<Protected pageName="KPI Targets"><KPITargets /></Protected>} />
          <Route path="/scheduled-reports" element={<Protected pageName="Scheduled Reports"><ScheduledReports /></Protected>} />
          <Route path="/bulk-import" element={<Protected pageName="Bulk Import"><BulkImportExport /></Protected>} />
          <Route path="/admin" element={<Protected pageName="Admin Panel"><AdminPanel /></Protected>} />
          <Route path="/admin" element={<Protected pageName="Admin Panel"><AdminPanel /></Protected>} />
          <Route path="/business-analytics" element={<Protected pageName="Business Analytics"><BusinessAnalytics /></Protected>} />
          <Route path="/live-dashboard" element={<Protected pageName="Live Dashboard"><LiveDashboard /></Protected>} />
          <Route path="/ftp-watcher" element={<Protected pageName="FTP Watcher"><FTPWatcher /></Protected>} />
          <Route path="/order-mgmt" element={<Protected pageName="Order Management"><OrderManagement /></Protected>} />
          <Route path="/supply-mgmt" element={<Protected pageName="Supply Management"><SupplyManagement /></Protected>} />
        </Routes>
      </Suspense>
      <CookieBanner />
    </>
  )
}

export default App


