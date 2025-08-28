import { PureComponent } from "react";

import { Typography } from "@/components/ui/Typography";
import { getDisplayVersion } from "@/utils/version";
import { cn } from "@/utils/cn";

//const footerBorder = 'border-t border-gray-200 dark:border-gray-700'
const footerGradient = 'bg-gradient-to-t from-white dark:from-gray-900 to-transparent'
const footerStyle = 'transition-colors duration-300'

class Footer extends PureComponent {
    render() {
        const version = getDisplayVersion()
        const year = new Date().getFullYear()

        return (
            <footer className={cn(
                footerGradient,
                //footerBorder,
                footerStyle,
                'px-4 mt-8'
            )}>
                <div className="max-w-7xl text-center pt-8 pb-4">
                    <Typography.Text size="sm" color="muted">
                        {`© ${year} Private Hub`} {version}
                    </Typography.Text>
                </div>
            </footer>
        )
    }
}
export default Footer