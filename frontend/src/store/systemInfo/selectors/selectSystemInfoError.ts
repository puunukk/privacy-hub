import type { RootState } from '@/store'

export const selectSystemInfoError = (state: RootState) => state.systemInfo.error
