// Helper function to apply theme to DOM
export function* applyTheme(theme: 'light' | 'dark' | 'auto'): Generator {
    let shouldBeDark = false

    if (theme === 'auto') {
        // Use system preference
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
        shouldBeDark = theme === 'dark'
    }

    if (shouldBeDark) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}
