import { call, put } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'

import { executeSystemCmd } from '@/api/executeSystemCmd'
import { showNotification } from '@/store/appConfig/appConfigSlice'
import { SystemCommands } from './types'

interface SystemCommandPayload {
    command: SystemCommands
}

function* systemPowerSaga(action: PayloadAction<SystemCommandPayload>): Generator {
    const { command } = action.payload

    try {
        yield call(executeSystemCmd, command)

        const messages: Record<SystemCommands, { title: string; message: string }> = {
            [SystemCommands.REBOOT]: { title: 'System Reboot Initiated', message: 'System will reboot in 1 minute.' },
            [SystemCommands.SHUTDOWN]: { title: 'System Shutdown Initiated', message: 'System will shutdown in 1 minute.' },
            [SystemCommands.FORCE_SHUTDOWN]: { title: 'Force Shutdown Initiated', message: 'System is shutting down immediately.' },
            [SystemCommands.FORCE_REBOOT]: { title: 'Force Reboot Initiated', message: 'System is rebooting immediately.' },
            [SystemCommands.RESTART_SERVICES]: { title: 'Services Restarted', message: 'System services have been restarted.' }
        }

        const message = messages[command] || { title: 'Command Executed', message: 'System command executed successfully.' }

        yield put(showNotification({
            id: `${command}-success-${Date.now()}`,
            type: 'success',
            title: message.title,
            message: message.message,
            duration: 5000,
            timestamp: Date.now(),
        }))
    } catch (error) {
        yield put(showNotification({
            id: `${command}-error-${Date.now()}`,
            type: 'error',
            title: 'Command Failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: 5000,
            timestamp: Date.now(),
        }))
    }
}

export { systemPowerSaga }
