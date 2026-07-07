import { useState, useEffect } from 'react'
import { reportsAPI } from '../services/api'

const DOMAIN_ID_MAP = {1:'Finance',2:'HR',3:'Operations',4:'Sales',5:'IT',6:'Healthcare',7:'Banking',8:'Retail',9:'Manufacturing',10:'Education',11:'General',12:'Telecom',13:'Energy'}

export function useReports() {
  const [reports, setReports] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all reports from backend
  const fetchReports = async (page = 1, limit = 20) => {
    try {
      setLoading(true)
      setError(null)
      const response = await reportsAPI.getAll({ page, limit })
      console.log('📊 Reports API Response:', response)
      
      // Handle paginated response
      if (response && response.data) {
        console.log('📊 Reports Count:', response.data.length)
        console.log('📊 Pagination:', response.pagination)
        setReports((Array.isArray(response.data.data) ? response.data.data : Array.isArray(response.data) ? response.data : []).map(r => ({ ...r, id: r.id || r.report_id, domain: r.domain || DOMAIN_ID_MAP[r.domain_id] || 'General', stakeholders: r.stakeholders || [], complianceStatus: r.compliance_status || 'Optional' })))
        setPagination(response.data.pagination || response.pagination || null)
      } 
      // Handle direct array response (no pagination)
      else if (Array.isArray(response)) {
        console.log('📊 Reports Array Length:', response.length)
        setReports(response)
        setPagination(null)
      }
      else {
        setReports([])
        setPagination(null)
      }
    } catch (err) {
      console.error('❌ Error fetching reports:', err)
      setError(err.message || 'Failed to fetch reports')
      setReports([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch single report
  const getReport = async (id) => {
    try {
      const data = await reportsAPI.getById(id)
      return data
    } catch (err) {
      console.error('Error fetching report:', err)
      throw err
    }
  }

  // Create new report
  const createReport = async (reportData) => {
    try {
      const newReport = await reportsAPI.create(reportData)
      setReports(prev => [...prev, newReport])
      return newReport
    } catch (err) {
      console.error('Error creating report:', err)
      throw err
    }
  }

  // Update existing report
  const updateReport = async (id, reportData) => {
    try {
      const updatedReport = await reportsAPI.update(id, reportData)
      setReports(prev => 
        prev.map(r => r.id === id ? updatedReport : r)
      )
      return updatedReport
    } catch (err) {
      console.error('Error updating report:', err)
      throw err
    }
  }

  // Delete report
  const deleteReport = async (id) => {
    try {
      await reportsAPI.delete(id)
      setReports(prev => prev.filter(r => r.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting report:', err)
      throw err
    }
  }

  // Refresh reports
  const refresh = () => {
    fetchReports()
  }

  // Initial fetch
  // Initial fetch handled by consumer (Dashboard calls fetchReports(1, 500))

  return {
    reports,
    pagination,
    loading,
    error,
    fetchReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    refresh,
  }
}






