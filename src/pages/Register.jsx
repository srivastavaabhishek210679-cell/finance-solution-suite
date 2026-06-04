import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'https://finance-backend-so86.onrender.com/api/v1'

function Register() {
  const [formData, setFormData] = useState({
    companyName:     '',
    firstName:       '',
    lastName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.companyName,
          first_name:   formData.firstName,
          last_name:    formData.lastName,
          email:        formData.email,
          password:     formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Registration failed')
        return
      }

      // Auto-login with returned token
      if (data.data?.token) {
        localStorage.setItem('token',              data.data.token)
        localStorage.setItem('token',         data.data.token)
        if (data.data.refreshToken) {
          localStorage.setItem('auth_refresh_token', data.data.refreshToken)
        }
        // Store user info
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }

        // Redirect to onboarding for new accounts
        if (data.data.onboarding) {
          window.location.href = '/onboarding'
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        // Legacy flow — redirect to login
        navigate('/login?registered=true')
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md border border-gray-700 shadow-2xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💼</div>
          <h1 className="text-2xl font-bold text-blue-400">Finance Solution Suite</h1>
          <p className="text-gray-400 text-sm mt-1">Create your company account</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-6 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Company name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Company Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="Acme Corporation"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Smith"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Work Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@company.com"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min. 8 characters"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Repeat password"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center text-gray-600 text-xs mt-4">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>

      </div>
    </div>
  )
}

export default Register


