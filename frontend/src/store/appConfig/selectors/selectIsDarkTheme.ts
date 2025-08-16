import { RootState } from "@/store";

export const selectIsDarkTheme = (state: RootState) => {
    const theme = state.appConfig.theme;

    if (theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    return theme === 'dark';
};