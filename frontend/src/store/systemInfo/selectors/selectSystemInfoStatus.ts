import type { RootState } from '@/store'

export const selectSystemInfoStatus = (state: RootState) => state.systemInfo.status
