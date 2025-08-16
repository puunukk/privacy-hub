import type { RootState } from '@/store'

export const selectSystemInfoData = (state: RootState) => state.systemInfo.data
