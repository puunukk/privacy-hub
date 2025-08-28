import { put } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'
import type { PutEffect } from 'redux-saga/effects'

import { setTheme } from '@/store/appConfig/appConfigSlice'
import type { Theme } from '@/store/appConfig/types'
import { logger } from '@/utils/logger'

export function* setThemeSaga(
    action: PayloadAction<{ theme: Theme }>
): Generator<PutEffect, void, unknown> {
    const { theme } = action.payload

    try {
        // Update Redux store (reducer handles DOM and localStorage)
        yield put(setTheme({ theme }))
        logger.debug(`Theme changed to: ${theme}`)
    } catch (error) {
        logger.error('Failed to set theme:', error)
    }
}
