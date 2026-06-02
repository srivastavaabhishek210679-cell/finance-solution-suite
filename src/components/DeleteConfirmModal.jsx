import { useState } from 'react'

function DeleteConfirmModal({ isOpen, onClose, onConfirm, report }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await onConfirm()
      onClose()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeleting(false)
    }
  }

  if (!isOpen || !report) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 text-red-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-white">Delete Report</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-4">
            Are you sure you want to delete this report?
          </p>

          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="font-semibold text-white mb-2">{report.name}</div>
            <div className="text-sm text-gray-400">
              Domain: {report.domain} • Frequency: {report.frequency}
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-sm text-red-200">
            <strong>Warning:</strong> This action cannot be undone. All data associated with this report will be permanently deleted.
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700 flex gap-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded text-white font-medium transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete Report'}
          </button>
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded text-white font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
