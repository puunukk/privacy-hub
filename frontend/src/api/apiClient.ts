import type { ApiResponse } from '@/api/types';

const ipUrl: string | undefined = import.meta.env.VITE_SERVER_URL;
const nameUrl: string | undefined = import.meta.env.HOSTNAME ? `${import.meta.env.HOSTNAME}.${import.meta.env.LOCAL_DOMAIN}` : undefined;

const API_URL = nameUrl || ipUrl || '';

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const url = `${API_URL}${endpoint}`;

        // TODO: Add a timeout to the fetch request
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });


        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || `HTTP ${response.status}`,
                message: data.message || 'Request failed',
            };
        }

        // Check if the response has a success field (wrapped response)
        if (data.hasOwnProperty('success')) {
            return data;
        }

        // If no success field, wrap the data in a success response
        return {
            success: true,
            data: data,
        };
    } catch (error: unknown) {
        console.error('API request failed:', error);
        return {
            success: false,
            error: 'Network error',
            message: error instanceof Error ? error.message : 'Failed to connect to server',
        };
    }
} 