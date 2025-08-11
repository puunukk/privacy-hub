import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react'

export const getContainerStatus = (state: string) => {
  switch (state.toLowerCase()) {
    case 'running':
      return { 
        icon: <CheckCircle className="h-4 w-4" />, 
        color: 'text-green-500', 
        text: 'Running' 
      }
    case 'exited':
      return { 
        icon: <Circle className="h-4 w-4" />, 
        color: 'text-red-500', 
        text: 'Stopped' 
      }
    case 'paused':
      return { 
        icon: <Clock className="h-4 w-4" />, 
        color: 'text-yellow-500', 
        text: 'Paused' 
      }
    default:
      return { 
        icon: <AlertCircle className="h-4 w-4" />, 
        color: 'text-gray-500', 
        text: state 
      }
  }
}