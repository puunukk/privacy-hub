import type { RootState } from '@/store'

export const selectAppStatus = (state: RootState) => state.appConfig.status
