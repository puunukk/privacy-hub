import { createRef, PureComponent } from 'react'
import type { RefObject, ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface DropdownItem {
    id: string
    label: string
    icon?: ReactNode
    onClick: () => void
    variant?: 'default' | 'danger' | 'warning'
    disabled?: boolean
}

interface DropdownProps {
    trigger: ReactNode
    items: DropdownItem[]
    className?: string
}

interface DropdownState {
    isOpen: boolean
}

export class Dropdown extends PureComponent<DropdownProps, DropdownState> {
    private dropdownRef: RefObject<HTMLDivElement>

    constructor(props: DropdownProps) {
        super(props)
        this.state = {
            isOpen: false
        }
        this.dropdownRef = createRef()
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside)
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside)
    }

    handleClickOutside = (event: MouseEvent) => {
        if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target as Node)) {
            this.setState({ isOpen: false })
        }
    }

    toggleDropdown = () => {
        this.setState(prevState => ({ isOpen: !prevState.isOpen }))
    }

    handleItemClick = (item: DropdownItem) => {
        if (!item.disabled) {
            item.onClick()
            this.setState({ isOpen: false })
        }
    }

    getItemVariantStyles = (variant?: 'default' | 'danger' | 'warning') => {
        switch (variant) {
            case 'danger':
                return 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
            case 'warning':
                return 'text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20'
            default:
                return 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }
    }

    render() {
        const { trigger, items, className } = this.props
        const { isOpen } = this.state

        return (
            <div ref={this.dropdownRef} className={cn('relative', className)}>
                {/* Trigger */}
                <div onClick={this.toggleDropdown} className="cursor-pointer">
                    {trigger}
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="py-2">
                            {items.map((item) => {
                                // Handle divider
                                if (item.label === '---') {
                                    return (
                                        <div key={item.id} className="my-1">
                                            <div className="h-px bg-gray-200 dark:bg-gray-700" />
                                        </div>
                                    )
                                }

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => this.handleItemClick(item)}
                                        disabled={item.disabled}
                                        className={cn(
                                            'w-full px-4 py-2 text-left flex items-center space-x-3 transition-colors',
                                            'disabled:opacity-50 disabled:cursor-not-allowed',
                                            this.getItemVariantStyles(item.variant)
                                        )}
                                    >
                                        {item.icon && (
                                            <span className="flex-shrink-0">
                                                {item.icon}
                                            </span>
                                        )}
                                        <span className="flex-1 text-sm font-medium">
                                            {item.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        )
    }
}
