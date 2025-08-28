/**
 * Global Application level types
 * These types are used across the application
 */
export declare namespace App {
    // Application Theme types, used in the application header and theme toggle
    type Theme = 'light' | 'dark' | 'auto'

    // Application Status types
    type ApplicationStatus = 'UNINITIALIZED' | 'INITIALIZING' | 'READY' | 'ERROR' | 'LOADING'
}