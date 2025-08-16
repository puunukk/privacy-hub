/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="node" />

declare module '*.svg' {
    import React = require('react');
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}

declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}

declare module '*.jpeg' {
    const src: string;
    export default src;
}

declare module '*.gif' {
    const src: string;
    export default src;
}

declare module '*.webp' {
    const src: string;
    export default src;
}

interface ImportMetaEnv {
    readonly VITE_PORT?: string;
    readonly VITE_SERVER_URL?: string;
    readonly VITE_APP_VERSION?: string;
    readonly MODE?: string;
    readonly HOSTNAME?: string;
    readonly LOCAL_DOMAIN?: string;
    readonly DOCKER_PROXY_URL?: string;
    readonly DOCKER_ENV?: string;
    readonly CHOKIDAR_USEPOLLING?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
