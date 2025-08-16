import type { RootState } from '@/store'

export const selectTheme = (state: RootState) => state.appConfig.theme