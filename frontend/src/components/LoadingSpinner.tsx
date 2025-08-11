import { RefreshCw } from 'lucide-react'

export const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex items-center space-x-2">
      <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
      <span className="text-lg text-gray-600">Loading Private Hub Dashboard...</span>
    </div>
  </div>
)