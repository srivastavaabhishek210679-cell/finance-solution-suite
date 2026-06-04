import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from './Loading'

const DEMO_ALLOWED_PATHS = ['/workspace', '/onboarding']
const PUBLIC_PATHS = ['/dashboard', '/workspace', '/onboarding', '/mfa-settings', '/upload-data', '/kpi-dashboard', '/ai-copilot', '/ai-insights', '/predictive-analytics', '/workflow-automation', '/executive-reporting', '/personalization', '/login', '/register']

const MODULE_PATHS = [
  '/payroll', '/budget-mgmt', '/expense-mgmt', '/invoices',
  '/leave-mgmt', '/attendance', '/performance-mgmt', '/recruitment-mgmt',
  '/training', '/travel', '/helpdesk', '/asset-mgmt',
  '/document-mgmt', '/risk-mgmt', '/sales-pipeline', '/crm-mgmt',
  '/vendor-mgmt', '/inventory-mgmt', '/contract-mgmt', '/resources-mgmt',
  '/project-mgmt', '/compliance'
]

function ProtectedRoute({ children }) {
  const { user, loading, isDemo } = useAuth()
  const location = useLocation()

  if (loading) return <Loading message="Checking authentication..." />
  if (!user) return <Navigate to="/login" replace />

  // Demo user restriction
  if (isDemo() && !DEMO_ALLOWED_PATHS.includes(location.pathname)) {
    return (
      <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:40,maxWidth:480,textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:16}}>🔒</div>
          <h2 style={{color:'#f1f5f9',fontSize:22,fontWeight:700,margin:'0 0 12px'}}>Demo Access Limited</h2>
          <p style={{color:'#64748b',fontSize:14,margin:'0 0 24px',lineHeight:1.6}}>Demo users can only view the workspace. Please sign up for a full account.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center'}}>
            <a href="/workspace" style={{background:'#334155',borderRadius:8,color:'#94a3b8',padding:'10px 20px',fontSize:13,textDecoration:'none'}}>← Workspace</a>
            <a href="/register" style={{background:'#10b981',borderRadius:8,color:'#fff',padding:'10px 20px',fontSize:13,fontWeight:600,textDecoration:'none'}}>Sign Up Free</a>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard only via workspace button
  if (location.pathname === '/dashboard') {
    const fromWorkspace = location.state?.from === 'workspace'
    if (!fromWorkspace) return <Navigate to="/login" replace />
  }

  // Module restriction - check if user has selected this module
  if (MODULE_PATHS.includes(location.pathname)) {
    const savedUser = localStorage.getItem('user')
    const workspace = localStorage.getItem('userWorkspace')
    if (workspace) {
      try {
        const ws = JSON.parse(workspace)
        const selectedModules = ws.selected_modules || []
        const hasPath = selectedModules.some(m => m === location.pathname)
        const hasDomainOnly = selectedModules.every(m => m.startsWith('domain:'))
        if (selectedModules.length > 0 && !hasPath && !hasDomainOnly) {
          return (
            <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:40,maxWidth:480,textAlign:'center'}}>
                <div style={{fontSize:48,marginBottom:16}}>🚫</div>
                <h2 style={{color:'#f1f5f9',fontSize:22,fontWeight:700,margin:'0 0 12px'}}>Module Not Accessible</h2>
                <p style={{color:'#64748b',fontSize:14,margin:'0 0 24px',lineHeight:1.6}}>
                  You don't have access to this module. Please update your workspace settings to add it.
                </p>
                <div style={{display:'flex',gap:12,justifyContent:'center'}}>
                  <a href="/workspace" style={{background:'#334155',borderRadius:8,color:'#94a3b8',padding:'10px 20px',fontSize:13,textDecoration:'none'}}>← Workspace</a>
                  <a href="/onboarding" style={{background:'#10b981',borderRadius:8,color:'#fff',padding:'10px 20px',fontSize:13,fontWeight:600,textDecoration:'none'}}>Update Workspace</a>
                </div>
              </div>
            </div>
          )
        }
      } catch(e) {}
    }
  }

  return children
}

export default ProtectedRoute
