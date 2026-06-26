// client.ts
const BASE_URL = 'http://localhost:8000/';

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method: options?.method || 'GET',
        ...options,
        headers,
    };

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const response = await fetch(`${BASE_URL}${cleanEndpoint}`, config);

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}