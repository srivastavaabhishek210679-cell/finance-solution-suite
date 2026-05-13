function ErrorMessage({ error, onRetry }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <svg 
            className="w-16 h-16 text-red-400 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Error Loading Data
          </h3>
          
          <p className="text-red-200 mb-4">
            {error || 'An unexpected error occurred'}
          </p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white transition-colors"
            >
              Try Again
            </button>
          )}
          
          <div className="mt-4 text-sm text-red-300">
            <p>Make sure your backend is running at:</p>
            <code className="bg-red-900/30 px-2 py-1 rounded mt-1 inline-block">
              http://localhost:3000/api/v1
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
