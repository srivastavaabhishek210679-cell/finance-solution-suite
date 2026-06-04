function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  )
}

export default Loading
