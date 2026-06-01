import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from './Loading'

const DEMO_ALLOWED_PATHS = ['/workspace', '/onboarding']

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
            <a href="/workspace" style={{background:'#334155',borderRadius:8,color:'#94a3b8',padding:'10px 20px',cursor:'pointer',fontSize:13,textDecoration:'none'}}>← Workspace</a>
            <a href="/register" style={{background:'#10b981',borderRadius:8,color:'#fff',padding:'10px 20px',cursor:'pointer',fontSize:13,fontWeight:600,textDecoration:'none'}}>Sign Up Free</a>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard only accessible via "Go to Dashboard" button from workspace
  if (location.pathname === '/dashboard') {
    const fromWorkspace = location.state?.from === 'workspace'
    if (!fromWorkspace) return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute