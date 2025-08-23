/**
 * Service Status Indicator - Shows real-time service health
 * Based on the heartbeat saga monitoring
 */

import { Component } from 'react'
import { Wifi, WifiOff, Activity, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ServiceHealth {
  backend: boolean
  docker: boolean
  pihole: boolean
  lastCheck: number
}

interface ServiceStatusProps {
  className?: string
  showDetails?: boolean
}

interface ServiceStatusState {
  serviceHealth: ServiceHealth;
  isOnline: boolean;
}

export class ServiceStatusIndicator extends Component<ServiceStatusProps, ServiceStatusState> {
  private interval?: NodeJS.Timeout;

  constructor(props: ServiceStatusProps) {
    super(props);
    this.state = {
      serviceHealth: {
        backend: false,
        docker: false,
        pihole: false,
        lastCheck: 0
      },
      isOnline: navigator.onLine
    };
  }

  componentDidMount() {
    // Listen for network status changes
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
    
    // Check immediately
    this.checkServices()
    
    // Check every 2 seconds (less aggressive than saga)
    this.interval = setInterval(this.checkServices, 2000)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
  }

  handleOffline = () => {
    this.setState({ isOnline: false });
  }

  checkServices = async () => {
    try {
      const [backendResponse, dockerResponse, piholeResponse] = await Promise.allSettled([
        fetch('/api/pi-system/health', { cache: 'no-cache' }).then(r => r.ok),
        fetch('/api/docker/version', { cache: 'no-cache' }).then(r => r.ok),
        fetch('/api/stats', { cache: 'no-cache' }).then(r => r.ok)
      ])
      
      this.setState({
        serviceHealth: {
          backend: backendResponse.status === 'fulfilled' ? backendResponse.value : false,
          docker: dockerResponse.status === 'fulfilled' ? dockerResponse.value : false,
          pihole: piholeResponse.status === 'fulfilled' ? piholeResponse.value : false,
          lastCheck: Date.now()
        }
      });
    } catch (error) {
      // Keep previous state on error
    }
  }
  
  render() {
    const { className, showDetails = false } = this.props;
    const { serviceHealth, isOnline } = this.state;
    
    const allServicesUp = serviceHealth.backend && serviceHealth.docker && serviceHealth.pihole
    const someServicesUp = serviceHealth.backend || serviceHealth.docker || serviceHealth.pihole
    const lastCheckAge = Date.now() - serviceHealth.lastCheck
    
    if (!showDetails) {
      // Compact indicator
      return (
        <div className={cn("flex items-center space-x-1", className)}>
          {!isOnline ? (
            <WifiOff className="w-4 h-4 text-red-500" />
          ) : allServicesUp ? (
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          ) : someServicesUp ? (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </div>
      )
    }
    
    // Detailed status
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700", className)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Services</span>
          <div className="flex items-center space-x-1">
            {!isOnline ? (
              <WifiOff className="w-4 h-4 text-red-500" />
            ) : allServicesUp ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            )}
          </div>
        </div>
        
        <div className="space-y-1 text-xs">
          <ServiceItem 
            name="Backend API" 
            status={serviceHealth.backend} 
            icon="🔧"
          />
          <ServiceItem 
            name="Docker" 
            status={serviceHealth.docker} 
            icon="🐳"
          />
          <ServiceItem 
            name="Pi-hole DNS" 
            status={serviceHealth.pihole} 
            icon="🛡️"
          />
        </div>
        
        {lastCheckAge < 5000 && (
          <div className="text-xs text-gray-500 mt-2">
            Last check: {Math.round(lastCheckAge / 1000)}s ago
          </div>
        )}
      </div>
    )
  }
}

const ServiceItem = ({ name, status, icon }: { name: string, status: boolean, icon: string }) => (
  <div className="flex items-center justify-between">
    <span className="flex items-center space-x-1">
      <span>{icon}</span>
      <span className="text-gray-700 dark:text-gray-300">{name}</span>
    </span>
    <span className={cn(
      "w-2 h-2 rounded-full",
      status ? "bg-green-500" : "bg-red-500"
    )} />
  </div>
)

export default ServiceStatusIndicator