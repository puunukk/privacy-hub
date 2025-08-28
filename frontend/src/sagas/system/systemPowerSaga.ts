import { call, put } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'

import { executeSystemCmd } from '@/api/executeSystemCmd'
import { showNotification } from '@/store/appConfig/appConfigSlice'

interface SystemPowerPayload {
    command: 'restart' | 'shutdown' | 'force-shutdown' | 'force-restart' | 'restart-services'
}

function* systemPowerSaga(action: PayloadAction<SystemPowerPayload>): Generator {
    const { command } = action.payload

    try {
        yield call(executeSystemCmd, command)

        const messages: Record<string, { title: string; message: string }> = {
            'restart': { title: 'System Reboot Initiated', message: 'System will reboot in 1 minute.' },
            'shutdown': { title: 'System Shutdown Initiated', message: 'System will shutdown in 1 minute.' },
            'force-shutdown': { title: 'Force Shutdown Initiated', message: 'System is shutting down immediately.' }
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
