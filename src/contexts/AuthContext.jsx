import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { setSentryUser, clearSentryUser } from '../sentry'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        // Check token expiry
        const tokenData = JSON.parse(atob(token.split('.')[1]))
        if (tokenData.exp * 1000 < Date.now()) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        } else {
          setUser(parsed)
        }
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authAPI.login(email, password)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      // Store role separately for easy access
      const role = email === 'alice.smith@demo.com' ? 'demo' : (response.user?.role || 'user')
      localStorage.setItem('userRole', role)
      setUser(response.user)
      setSentryUser(response.user)
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await authAPI.register(userData)
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('userRole', response.user?.role || 'user')
        setUser(response.user)
        setSentryUser(response.user)
      }
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      setUser(null)
      setError(null)
      clearSentryUser()
    }
  }

  const isAuthenticated = () => !!user && !!localStorage.getItem('token')
  const isDemo = () => localStorage.getItem('userRole') === 'demo'
  const isAdmin = () => localStorage.getItem('userRole') === 'admin'

  const value = { user, loading, error, login, register, logout, isAuthenticated, isDemo, isAdmin, setError }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}