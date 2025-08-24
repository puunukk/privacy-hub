import type { ApiResponse } from '@/api/types';

// Since the frontend is served from the same NGINX server, we use relative URLs
// This avoids CORS issues and works in all environments
const API_URL = '';

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        // Use relative URL - NGINX will proxy to the correct service
        const url = `${API_URL}${endpoint}`;

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