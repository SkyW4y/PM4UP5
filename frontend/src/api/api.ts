import { apiClient } from "./client";
import * as M from "./mappers";

// ==========================================
// 1. АУТЕНТИФИКАЦИЯ (Auth)
// ==========================================
export const authApi = {
    register: async (payload: any): Promise<M.AuthResponse> => {
        const data = await apiClient<M.ApiTokenResponse>('auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return { accessToken: data.access_token, user: data.user };
    },

    login: async (payload: any): Promise<M.AuthResponse> => {
        const data = await apiClient<M.ApiTokenResponse>('auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return { accessToken: data.access_token, user: data.user };
    },

    refresh: async (): Promise<M.ApiUserFull> => {
        const data = await apiClient<M.ApiTokenResponse>('auth/refresh', { method: 'POST' });
        localStorage.setItem('token', data.access_token);
        return data.user;
    }
};

// ==========================================
// 2. ПАНЕЛЬ МОНИТОРИНГА (Dashboard)
// ==========================================
export const dashboardApi = {
    getDeadlines: async (skip = 0, limit = 10): Promise<M.UiDeadline[]> => {
        const data = await apiClient<M.ApiDeadlineShort[]>(`dashboard/deadlines?skip=${skip}&limit=${limit}`);
        return data.map(M.mapDeadline);
    },

    getDeadlineById: async (id: number): Promise<M.UiDeadline> => {
        const data = await apiClient<M.ApiDeadlineFull>(`dashboard/deadlines/${id}`);
        return M.mapDeadline(data);
    },

    getProjects: async (skip = 0, limit = 10): Promise<M.UiProjectShort[]> => {
        const data = await apiClient<M.ApiProjectShort[]>(`dashboard/projects?skip=${skip}&limit=${limit}`);
        return data.map(M.mapProjectShort);
    },

    getStats: async (): Promise<M.ApiDashboardStats> => {
        return apiClient<M.ApiDashboardStats>('dashboard/stats');
    }
};

// ==========================================
// 3. УПРАВЛЕНИЕ ПРОЕКТАМИ И КАНБАН (Projects)
// ==========================================
export const projectsApi = {
    getById: async (projectId: number): Promise<M.UiProjectFull> => {
        const data = await apiClient<M.ApiProjectFull>(`projects/${projectId}`);
        return M.mapProjectFull(data);
    },

    create: async (payload: { name: string; subject_id: number; deadline: string; group_id?: number | null }): Promise<M.UiProjectFull> => {
        const data = await apiClient<M.ApiProjectFull>('projects', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return M.mapProjectFull(data);
    },

    deleteProject: async (projectId: number): Promise<void> => {
        return apiClient<void>(`projects/projects/${projectId}`, { method: 'DELETE' });
    },

    // Столбцы (Columns)
    createColumn: async (projectId: number, payload: { name: string }): Promise<M.ApiProjectColumnFull> => {
        return apiClient<M.ApiProjectColumnFull>(`projects/${projectId}/columns`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    getColumn: async (projectId: number, columnId: number): Promise<M.ApiProjectColumnFull> => {
        return apiClient<M.ApiProjectColumnFull>(`projects/${projectId}/columns/${columnId}`);
    },

    deleteColumn: async (columnId: number): Promise<void> => {
        return apiClient<void>(`projects/columns/${columnId}`, { method: 'DELETE' });
    },

    // Карточки (Cards)
    createCard: async (projectId: number, columnId: number, payload: { title: string; description?: string }): Promise<M.UiCard> => {
        const data = await apiClient<M.ApiCardFull>(`projects/${projectId}/columns/${columnId}/cards`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return M.mapCard(data);
    },

    getCard: async (projectId: number, columnId: number, cardId: number): Promise<M.UiCard> => {
        const data = await apiClient<M.ApiCardFull>(`projects/${projectId}/columns/${columnId}/cards/${cardId}`);
        return M.mapCard(data);
    },

    deleteCard: async (cardId: number): Promise<void> => {
        return apiClient<void>(`projects/cards/${cardId}`, { method: 'DELETE' });
    },

    // Патч всей доски (Drag-n-Drop операции)
    patchDelta: async (projectId: number, delta: { name?: string; deadline?: string; columns?: any[]; cards?: any[] }): Promise<void> => {
        console.log(JSON.stringify(delta));
        return apiClient<void>(`projects/${projectId}/delta`, {
            method: 'PATCH',
            body: JSON.stringify(delta)
        });
    },

    // Команда проекта (Members)
    addUser: async (projectId: number, userId: number): Promise<void> => {
        return apiClient<void>(`projects/${projectId}/users/${userId}`, { method: 'POST' });
    },

    removeUser: async (projectId: number, userId: number): Promise<void> => {
        return apiClient<void>(`projects/${projectId}/users/${userId}`, { method: 'DELETE' });
    }
};

// ==========================================
// 4. ДЕЙСТВИЯ С ГРУППАМИ (User Groups)
// ==========================================
export const groupsApi = {
    createGroup: async (payload: { name: string; leader_id?: number | null }): Promise<M.ApiGroupFull> => {
        return apiClient<M.ApiGroupFull>('user/group', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    removeUserFromGroup: async (uid: number): Promise<M.ApiGroupFull> => {
        return apiClient<M.ApiGroupFull>(`user/group/${uid}`, { method: 'DELETE' });
    },

    getInviteLink: async (): Promise<{ invite_link?: string; [key: string]: any }> => {
        return apiClient<{ [key: string]: any }>('user/group/invite-link');
    },

    joinByInvite: async (inviteCode: string): Promise<void> => {
        return apiClient<void>(`user/group/join/${inviteCode}`, { method: 'POST' });
    }
};

// ==========================================
// 5. ПРЕДМЕТЫ И СТУДЕНЧЕСКИЕ ЗАДАЧИ (Subjects & Tasks)
// ==========================================
export const subjectsApi = {
    getSubjects: async (): Promise<M.ApiSubjectShort[]> => {
        return apiClient<M.ApiSubjectShort[]>('subjects');
    },

    createSubject: async (payload: { name: string }): Promise<M.ApiSubjectShort> => {
        return apiClient<M.ApiSubjectShort>('subjects', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    patchSubjectDelta: async (subjectId: number, delta: { name?: string; tasks?: any[] }): Promise<void> => {
        return apiClient<void>(`subjects/${subjectId}/delta`, {
            method: 'PATCH',
            body: JSON.stringify(delta)
        });
    },

    createTaskForSubject: async (payload: { task: string; short_description: string; deadline: string; subject_id: number; task_class?: string; task_type?: string }): Promise<M.UiDeadline> => {
        const data = await apiClient<M.ApiDeadlineFull>('subjects/tasks', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return M.mapDeadline(data);
    },

    toggleTaskStatus: async (subjectTaskId: number, status: boolean): Promise<void> => {
        return apiClient<void>(`user/tasks/${subjectTaskId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }
};