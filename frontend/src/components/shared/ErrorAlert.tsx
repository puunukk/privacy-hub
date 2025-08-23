import { AlertCircle } from 'lucide-react'

interface ErrorAlertProps {
  error: string
}

export const ErrorAlert = ({ error }: ErrorAlertProps) => (
  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center space-x-2">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <span className="text-red-700 font-medium">Error:</span>
      <span className="text-red-600">{error}</span>
    </div>
  </div>
)