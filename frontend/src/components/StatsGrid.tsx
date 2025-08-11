import { Server, Activity, Cpu, MemoryStick } from 'lucide-react'
import type { DockerInfo } from '../types/docker'
import { formatBytes } from '../utils/docker'

interface StatsGridProps {
  dockerInfo: DockerInfo
}

export const StatsGrid = ({ dockerInfo }: StatsGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Total Containers</p>
          <p className="text-2xl font-bold text-gray-900">{dockerInfo.Containers}</p>
        </div>
        <Server className="h-8 w-8 text-blue-500" />
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Running</p>
          <p className="text-2xl font-bold text-green-600">{dockerInfo.ContainersRunning}</p>
        </div>
        <Activity className="h-8 w-8 text-green-500" />
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">CPU Cores</p>
          <p className="text-2xl font-bold text-gray-900">{dockerInfo.NCPU}</p>
        </div>
        <Cpu className="h-8 w-8 text-purple-500" />
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Memory</p>
          <p className="text-2xl font-bold text-gray-900">{formatBytes(dockerInfo.MemTotal)}</p>
        </div>
        <MemoryStick className="h-8 w-8 text-orange-500" />
      </div>
    </div>
  </div>
)