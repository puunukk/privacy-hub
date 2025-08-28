import { apiClient } from './apiClient'

export async function fetchMetrics() {
  const response = await apiClient('/api/metrics')
  if (response.success) {
    return response.data
  }
  throw new Error(response.error || 'Failed to fetch metrics')
}