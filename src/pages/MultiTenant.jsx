import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import Sidebar from '../components/Sidebar'
import { Building2, Users, Database, Settings, TrendingUp, AlertCircle, Plus, Edit, Trash2, Eye } from 'lucide-react'

function MultiTenant() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for demonstration - replace with API calls
  const mockTenants = [
    {
      id: 1,
      name: 'Acme Corporation',
      domain: 'acme.com',
      status: 'active',
      plan: 'Enterprise',
      users: 45,
      reports: 320,
      storage: '12.5 GB',
      created: '2024-01-15',
      lastActive: '2026-05-06'
    },
    {
      id: 2,
      name: 'TechStart Inc',
      domain: 'techstart.io',
      status: 'active',
      plan: 'Professional',
      users: 12,
      reports: 85,
      storage: '3.2 GB',
      created: '2024-03-20',
      lastActive: '2026-05-05'
    },
    {
      id: 3,
      name: 'Global Finance Ltd',
      domain: 'globalfinance.com',
      status: 'active',
      plan: 'Enterprise',
      users: 120,
      reports: 850,
      storage: '45.8 GB',
      created: '2023-11-10',
      lastActive: '2026-05-06'
    },
    {
      id: 4,
      name: 'SmallBiz Co',
      domain: 'smallbiz.com',
      status: 'inactive',
      plan: 'Basic',
      users: 5,
      reports: 20,
      storage: '0.5 GB',
      created: '2025-02-01',
      lastActive: '2026-03-15'
    }
  ]

  useEffect(() => {
    // Load tenants - replace with actual API call
    setTenants(mockTenants)
  }, [])

  // Filter tenants
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.domain.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    totalUsers: tenants.reduce((sum, t) => sum + t.users, 0),
    totalReports: tenants.reduce((sum, t) => sum + t.reports, 0)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Multi-Tenant Management</h1>
            <p className="text-gray-400">Manage all tenant organizations and their data isolation</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-white">{stats.total}</span>
              </div>
              <div className="text-sm text-gray-400">Total Tenants</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-white">{stats.active}</span>
              </div>
              <div className="text-sm text-gray-400">Active Tenants</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
              </div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Database className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold text-white">{stats.totalReports}</span>
              </div>
              <div className="text-sm text-gray-400">Total Reports</div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterStatus === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterStatus === 'inactive'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Inactive
                </button>
              </div>

              {/* Add New Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Tenant
              </button>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Reports
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Storage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{tenant.name}</div>
                          <div className="text-sm text-gray-400">{tenant.domain}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tenant.status === 'active'
                              ? 'bg-green-900 text-green-300'
                              : 'bg-red-900 text-red-300'
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{tenant.plan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{tenant.users}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{tenant.reports}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{tenant.storage}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">{tenant.lastActive}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedTenant(tenant)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTenant(tenant)
                              setIsModalOpen(true)
                            }}
                            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${tenant.name}?`)) {
                                // Delete tenant
                              }
                            }}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTenants.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No tenants found</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-300 font-medium mb-1">Data Isolation</h4>
                <p className="text-blue-200 text-sm">
                  Each tenant has completely isolated data. Users can only access data within their own tenant organization.
                  Row-level security ensures strict data separation at the database level.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MultiTenant

