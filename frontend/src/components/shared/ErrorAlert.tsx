import { AlertCircle } from 'lucide-react'

interface ErrorAlertProps {
  error: string
}

export const ErrorAlert = ({ error }: ErrorAlertProps) => (
  <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
    <div className="flex items-center space-x-2">
      <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
      <span className="text-red-700 dark:text-red-300 font-medium">Error:</span>
      <span className="text-red-600 dark:text-red-400">{error}</span>
    </div>
  </div>
)