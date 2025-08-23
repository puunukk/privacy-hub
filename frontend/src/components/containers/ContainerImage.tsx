import { Component } from 'react'
import { cn } from '@/utils/cn'

interface ContainerImageProps {
  imageName: string
  imageTag: string
  fullImage: string
}

export class ContainerImage extends Component<ContainerImageProps> {
  render() {
    const { imageName, imageTag, fullImage } = this.props

    const tagClasses = cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      imageTag === 'latest'
        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
        : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
    )

    const sectionClasses = cn("space-y-2")
    const labelClasses = cn("text-xs font-medium text-gray-700 dark:text-gray-300", "uppercase tracking-wide")
    const valueClasses = cn("text-sm text-gray-900 dark:text-white")

    return (
      <div className={sectionClasses}>
        <div className={labelClasses}>Image</div>
        <div className="flex items-center justify-between">
          <span
            className={valueClasses}
            title={`Full Image: ${fullImage}\nImage Name: ${imageName}`}
          >
            {imageName}
          </span>
          <span
            className={tagClasses}
            title={`Image Tag: ${imageTag}\n${imageTag === 'latest' ? 'This is the latest version' : 'This is a specific version'}`}
          >
            {imageTag}
          </span>
        </div>
      </div>
    )
  }
}