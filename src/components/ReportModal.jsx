import { useState, useEffect } from 'react'
import { DOMAINS, FREQUENCIES, COMPLIANCE_STATUSES, STAKEHOLDERS } from '../data/reportsData'

function ReportModal({ isOpen, onClose, onSave, report, mode = 'create' }) {
  const [formData, setFormData] = useState({
    domain: '',
    frequency: '',
    name: '',
    description: '',
    complianceStatus: 'Optional',
    stakeholders: [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Load report data when editing
  useEffect(() => {
    if (report && mode === 'edit') {
      setFormData({
        domain: report.domain || '',
        frequency: report.frequency || '',
        name: report.name || '',
        description: report.description || '',
        complianceStatus: report.complianceStatus || 'Optional',
        stakeholders: report.stakeholders || [],
      })
    } else {
      // Reset form for create mode
      setFormData({
        domain: '',
        frequency: '',
        name: '',
        description: '',
        complianceStatus: 'Optional',
        stakeholders: [],
      })
    }
  }, [report, mode, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStakeholderToggle = (stakeholder) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.includes(stakeholder)
        ? prev.stakeholders.filter(s => s !== stakeholder)
        : [...prev.stakeholders, stakeholder]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name || !formData.domain || !formData.frequency) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.stakeholders.length === 0) {
      setError('Please select at least one stakeholder')
      return
    }

    try {
      setSaving(true)
      // Map domain name to domain_id
      const DOMAIN_MAP = { 'HR':2,'Operations':3,'Sales':4,'IT':5,'Healthcare':6,'Banking':7,'Telecom':8,'Retail':9,'Energy':10,'Manufacturing':11,'Education':12,'General':13,'Finance':13,'Tax':13,'Audit':13,'Risk':13,'Treasury':13,'Legal':13,'Marketing':13,'Supply Chain':13,'ESG':13 }
      const payload = { domain_id: DOMAIN_MAP[formData.domain] || 13, name: formData.name, description: formData.description, frequency: formData.frequency, compliance_status: formData.complianceStatus, stakeholders: JSON.stringify(formData.stakeholders) }
      delete payload.domain
      await onSave(payload)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save report')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'edit' ? 'Edit Report' : 'Create New Report'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Report Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Report Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Cash Flow Report"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Describe what this report tracks..."
            />
          </div>

          {/* Domain and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Domain <span className="text-red-400">*</span>
              </label>
              <select
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Domain</option>
                {DOMAINS.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frequency <span className="text-red-400">*</span>
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Frequency</option>
                {FREQUENCIES.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Compliance Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Compliance Status <span className="text-red-400">*</span>
            </label>
            <select
              name="complianceStatus"
              value={formData.complianceStatus}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            >
              {COMPLIANCE_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Stakeholders */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stakeholders <span className="text-red-400">*</span>
            </label>
            <div className="bg-gray-700 border border-gray-600 rounded p-4 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {STAKEHOLDERS.map(stakeholder => (
                  <label
                    key={stakeholder}
                    className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={formData.stakeholders.includes(stakeholder)}
                      onChange={() => handleStakeholderToggle(stakeholder)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                    {stakeholder}
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Selected: {formData.stakeholders.length} stakeholder(s)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded text-white font-medium transition-colors"
            >
              {saving ? 'Saving...' : mode === 'edit' ? 'Update Report' : 'Create Report'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded text-white font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportModal



