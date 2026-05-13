import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import Sidebar from '../components/Sidebar'
import { Users, Plus, Edit, Trash2, Eye, Search, Filter, FileText, TrendingUp, Building } from 'lucide-react'

function CustomerManagement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Mock customer data - replace with API calls
  const mockCustomers = [
    {
      id: 1,
      name: 'Global Manufacturing Co',
      industry: 'Manufacturing',
      contactPerson: 'John Smith',
      email: 'john.smith@globalmanuf.com',
      phone: '+1 234-567-8900',
      assignedReports: 45,
      activeUsers: 12,
      status: 'active',
      revenue: '$125,000',
      joined: '2024-01-15',
      lastActivity: '2026-05-06'
    },
    {
      id: 2,
      name: 'Tech Innovations Inc',
      industry: 'Technology',
      contactPerson: 'Sarah Johnson',
      email: 'sarah.j@techinnovations.com',
      phone: '+1 234-567-8901',
      assignedReports: 32,
      activeUsers: 8,
      status: 'active',
      revenue: '$89,500',
      joined: '2024-02-20',
      lastActivity: '2026-05-05'
    },
    {
      id: 3,
      name: 'Healthcare Plus',
      industry: 'Healthcare',
      contactPerson: 'Dr. Michael Chen',
      email: 'm.chen@healthcareplus.com',
      phone: '+1 234-567-8902',
      assignedReports: 68,
      activeUsers: 25,
      status: 'active',
      revenue: '$210,000',
      joined: '2023-11-10',
      lastActivity: '2026-05-06'
    },
    {
      id: 4,
      name: 'Retail Solutions Ltd',
      industry: 'Retail',
      contactPerson: 'Emma Davis',
      email: 'e.davis@retailsolutions.com',
      phone: '+1 234-567-8903',
      assignedReports: 15,
      activeUsers: 5,
      status: 'inactive',
      revenue: '$32,000',
      joined: '2025-03-01',
      lastActivity: '2026-03-20'
    }
  ]

  useEffect(() => {
    // Load customers - replace with actual API call
    setCustomers(mockCustomers)
  }, [])

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || customer.status === filterType
    return matchesSearch && matchesType
  })

  // Calculate stats
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalReports: customers.reduce((sum, c) => sum + c.assignedReports, 0),
    totalRevenue: customers.reduce((sum, c) => {
      const revenue = parseFloat(c.revenue.replace(/[$,]/g, ''))
      return sum + revenue
    }, 0)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Customer Management</h1>
            <p className="text-gray-400">Manage your customers and track their reports and analytics</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-white">{stats.total}</span>
              </div>
              <div className="text-sm text-gray-400">Total Customers</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-white">{stats.active}</span>
              </div>
              <div className="text-sm text-gray-400">Active Customers</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-white">{stats.totalReports}</span>
              </div>
              <div className="text-sm text-gray-400">Assigned Reports</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Building className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold text-white">${(stats.totalRevenue / 1000).toFixed(0)}K</span>
              </div>
              <div className="text-sm text-gray-400">Total Revenue</div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 w-full md:w-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('active')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterType === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterType('inactive')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterType === 'inactive'
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
                Add Customer
              </button>
            </div>
          </div>

          {/* Customers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-all"
              >
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{customer.name}</h3>
                    <span className="text-sm text-gray-400">{customer.industry}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'active'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{customer.contactPerson}</span>
                  </div>
                  <div className="text-sm text-gray-400">{customer.email}</div>
                  <div className="text-sm text-gray-400">{customer.phone}</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-700">
                  <div>
                    <div className="text-2xl font-bold text-white">{customer.assignedReports}</div>
                    <div className="text-xs text-gray-400">Reports</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{customer.activeUsers}</div>
                    <div className="text-xs text-gray-400">Users</div>
                  </div>
                </div>

                {/* Revenue & Date */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-green-400 font-semibold">{customer.revenue}</span>
                  <span className="text-gray-400">Joined {customer.joined}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setIsModalOpen(true)
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
                        // Delete customer
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCustomers.length === 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No customers found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first customer'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add First Customer
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default CustomerManagement
