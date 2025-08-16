export const parseImageName = (fullImage: string): { name: string; tag: string } => {
    const parts = fullImage.split(':')
    if (parts.length === 1) {
        return { name: fullImage, tag: 'latest' }
    }
    const tag = parts.pop() || 'latest'
    const name = parts.join(':')
    return { name, tag }
}
