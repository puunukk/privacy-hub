import { apiClient } from '@/api/apiClient';
import type { ApiResponse } from '@/api/types';

// Pi-hole v6 API authentication response
interface PiholeAuthResponse {
    session: {
        valid: boolean;
        sid?: string;
        validity?: number;
    };
}

// Pi-hole v6 API stats
interface PiholeStats {
    queries?: {
        total?: number;
        blocked?: number;
        percent_blocked?: number;
    };
    clients?: {
        total?: number;
        active?: number;
    };
    status?: {
        enabled?: boolean;
    };
}

/**
 * Authenticate with Pi-hole API and get session
 */
export async function authenticatePihole(password: string): Promise<string | null> {
    try {
        const response = await fetch('/pi-hole/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
            credentials: 'include'
        });
        
        if (response.ok) {
            const data: PiholeAuthResponse = await response.json();
            if (data.session?.valid && data.session?.sid) {
                return data.session.sid;
            }
        }
        return null;
    } catch (error) {
        console.error('Pi-hole authentication failed:', error);
        return null;
    }
}

// Cache session ID to avoid re-authenticating every time
let cachedSid: string | null = null;
let sidExpiry: number = 0;

/**
 * Get or refresh Pi-hole session ID
 */
async function getSid(): Promise<string | null> {
    // Check if cached SID is still valid (with 5 minute buffer)
    if (cachedSid && Date.now() < sidExpiry - 300000) {
        return cachedSid;
    }
    
    // Authenticate and cache new SID
    const sid = await authenticatePihole('123qwe');
    if (sid) {
        cachedSid = sid;
        sidExpiry = Date.now() + 1800000; // 30 minutes
    }
    return sid;
}

/**
 * Fetch Pi-hole statistics
 */
export async function fetchPiholeStats(): Promise<ApiResponse<PiholeStats>> {
    try {
        const sid = await getSid();
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        
        if (sid) {
            headers['X-FTL-SID'] = sid;
        }
        
        // Try to get stats - use the endpoint that exists
        const response = await apiClient<PiholeStats>('/pi-hole/api/stats/summary', {
            headers,
            credentials: 'include'
        });
        
        // If unauthorized, clear cache and retry once
        if (!response.success && response.error === 'HTTP 401') {
            cachedSid = null;
            sidExpiry = 0;
            const newSid = await getSid();
            if (newSid) {
                headers['X-FTL-SID'] = newSid;
                const retryResponse = await apiClient<PiholeStats>('/pi-hole/api/stats/summary', {
                    headers,
                    credentials: 'include'
                });
                if (retryResponse.success) {
                    return retryResponse;
                }
            }
        }
        
        if (response.success) {
            return response;
        }
        
        return {
            success: false,
            error: 'API Error', 
            message: 'Unable to fetch Pi-hole stats. Authentication may be required.'
        };
    } catch (error) {
        console.error('Pi-hole API error:', error);
        return {
            success: false,
            error: 'Network error',
            message: error instanceof Error ? error.message : 'Failed to connect to Pi-hole'
        };
    }
}

/**
 * Check Pi-hole service health
 */
export async function checkPiholeHealth(): Promise<boolean> {
    try {
        const response = await fetch('/pi-hole/api/auth', { 
            method: 'GET',
            credentials: 'include'
        });
        
        // If we get a response (even 401), Pi-hole is running
        return response.ok || response.status === 401;
    } catch {
        return false;
    }
}