// ==========================================
// 1. СЫРЫЕ ТИПЫ БЭКЕНДА
// ==========================================

export interface ApiUserShort {
    id: number;
    username: string;
    first_name: string | null;
    last_name: string | null;
    avatar: string;
}

export interface ApiUserFull {
    id: number;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar: string;
    group_id: number | null;
    group_rel: { id: number; name: string } | null;
}

export interface ApiTokenResponse {
    access_token: string;
    token_type: string;
    user: ApiUserFull;
}

export interface ApiSubjectShort {
    id: number;
    name: string;
    group_id: number;
}

export interface ApiDeadlineShort {
    id: number;
    task_class: 'solo' | 'group';
    task_type: 'homework' | 'classwork' | 'project';
    short_description: string;
    deadline: string;
    subject: ApiSubjectShort;
    is_completed: boolean;
    icon?: string;
}

export interface ApiDeadlineFull extends ApiDeadlineShort {
    task: string;
    group_id: number;
}

export interface ApiProjectShort {
    id: number;
    name: string;
    deadline: string;
    group_id: number;
    subject: ApiSubjectShort;
    progress_percent: number;
    project_group: Array<{
        user_id: number;
        user_name: string;
        avatar_url: string;
    }>;
    icon?: string;
}

export interface ApiCardShort {
    id: number;
    title: string;
    description: string | null;
    deadline_date: string | null;
    color: string | null;
    position: number;
    column_id: number;
    responsible_id: number | null;
}

export interface ApiCommentResponse {
    id: number;
    text: string;
    created_at: string;
    card_id: number;
    user_id: number;
    user: ApiUserShort;
}

export interface ApiCardFull extends ApiCardShort {
    responsible: ApiUserShort | null;
    comments: ApiCommentResponse[];
}

export interface ApiProjectColumnFull {
    id: number;
    name: string;
    position: number;
    project_id: number;
    cards: ApiCardShort[];
}

export interface ApiProjectFull {
    id: number;
    name: string;
    group_id: number;
    subject: ApiSubjectShort;
    deadline: string;
    project_group: ApiUserShort[];
    progress_percent: number;
    columns: ApiProjectColumnFull[];
}

export interface ApiGroupFull {
    id: number;
    name: string;
    leader_id: number | null;
}

export interface ApiDashboardStats {
    total_tasks: number;
    completed_tasks_by_group: number;
    completed_tasks_by_user: number;
}

// ==========================================
// 2. ЧИСТЫЕ ИНТЕРФЕЙСНЫЕ ТИПЫ ДЛЯ UI
// ==========================================

export type UserProfile = ApiUserFull;

export interface AuthResponse {
    accessToken: string;
    user: UserProfile;
}

export interface UiDeadline {
    id: number;
    subject: string;
    workType: 'homework' | 'classwork' | 'project';
    taskClass: 'solo' | 'group';
    deadlineStr: string;
    daysLeft: number;
    cardIcon: string;
    shortDescription: string;
    isCompleted: boolean;
    taskDetail?: string;
    groupId?: number;
}

export interface UiProjectShort {
    id: number;
    name: string;
    subject: string;
    deadlineStr: string;
    daysLeft: number;
    cardIcon: string;
    progressPercent: number;
    members: Array<{ uid: number; username: string; avaUrl: string }>;
}

export interface UiCard {
    id: number;
    title: string;
    description: string;
    deadline: string | null;
    color: string | null;
    position: number;
    columnId: number;
    responsibleId: number | null;
    responsibleUser?: ApiUserShort | null;
    comments?: ApiCommentResponse[];
}

export interface UiColumn {
    id: number;
    name: string;
    position: number;
    projectId: number;
    cards: UiCard[];
}

export interface UiProjectFull {
    id: number;
    name: string;
    groupId: number;
    subjectName: string;
    deadlineStr: string;
    daysLeft: number;
    progressPercent: number;
    projectGroup: ApiUserShort[];
    columns: UiColumn[];
}

// ==========================================
// 3. ВСПЕМОГАТЕЛЬНЫЕ ФУНКЦИИ И МАППЕРЫ
// ==========================================

function getRemainingDays(date: string): number {
    const targetDate = new Date(date);
    const curDate = new Date();
    targetDate.setHours(0, 0, 0, 0);
    curDate.setHours(0, 0, 0, 0);
    const diffMs = targetDate.getTime() - curDate.getTime();
    return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export function mapDeadline(api: ApiDeadlineShort | ApiDeadlineFull): UiDeadline {
    return {
        id: api.id,
        subject: api.subject.name,
        workType: api.task_type,
        taskClass: api.task_class,
        deadlineStr: new Date(api.deadline).toLocaleDateString("ru-RU"),
        daysLeft: getRemainingDays(api.deadline),
        cardIcon: api.icon || "📌",
        shortDescription: api.short_description || "Без описания",
        isCompleted: api.is_completed,
        taskDetail: 'task' in api ? api.task : undefined,
        groupId: 'group_id' in api ? api.group_id : undefined
    };
}

export function mapProjectShort(api: ApiProjectShort): UiProjectShort {
    return {
        id: api.id,
        name: api.name,
        subject: api.subject.name,
        deadlineStr: new Date(api.deadline).toLocaleDateString("ru-RU"),
        daysLeft: getRemainingDays(api.deadline),
        cardIcon: api.icon || "⚡",
        progressPercent: api.progress_percent,
        members: (api.project_group || []).map(m => ({
            uid: m.user_id,
            username: m.user_name,
            avaUrl: m.avatar_url
        }))
    };
}

export function mapCard(api: ApiCardShort | ApiCardFull): UiCard {
    return {
        id: api.id,
        title: api.title,
        description: api.description || "",
        deadline: api.deadline_date ? new Date(api.deadline_date).toLocaleDateString("ru-RU") : null,
        color: api.color,
        position: api.position,
        columnId: api.column_id,
        responsibleId: api.responsible_id,
        responsibleUser: 'responsible' in api ? api.responsible : undefined,
        comments: 'comments' in api ? api.comments : undefined
    };
}

export function mapProjectFull(api: ApiProjectFull): UiProjectFull {
    return {
        id: api.id,
        name: api.name,
        groupId: api.group_id,
        subjectName: api.subject.name,
        deadlineStr: new Date(api.deadline).toLocaleDateString("ru-RU"),
        daysLeft: getRemainingDays(api.deadline),
        progressPercent: api.progress_percent,
        projectGroup: api.project_group || [],
        columns: (api.columns || []).map(col => ({
            id: col.id,
            name: col.name,
            position: col.position,
            projectId: col.project_id,
            cards: (col.cards || []).map(mapCard)
        }))
    };
}