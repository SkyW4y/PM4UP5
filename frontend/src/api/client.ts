const BASE_URL = 'http://localhost:8000/'; // Исправить на адрес VPS сервера при деплое

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const config: RequestInit = {
        method: options?.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
        ...options,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Если сервер возвращает пустой ответ
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}