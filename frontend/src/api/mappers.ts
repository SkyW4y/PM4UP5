// --- Интерфейсы того, что получаем с сервера ---
export interface ApiDeadlineShort {
    id: number;
    task_class: string;
    task_type: string;
    short_description: string;
    deadline: string;
    subject: {
        name: string;
        id: number;
        group_id: number;
    }
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
    icon?: string;
    group_id: number;
    project_group: Array<{
        user_id: number;
        user_name: string;
        avatar_url: string;
    }>;
    subject: {
        name: string;
        id: number;
        group_id: number;
    }
    progress_percent: number;
}

// --- 2. Функции-мапперы (Переводчики) ---

function getRemainingDays(date: string) : number {
    const targetDate = new Date(date);
    const curDate = new Date();

    targetDate.setHours(0, 0, 0, 0);
    curDate.setHours(0, 0, 0, 0);

    const diffMs = targetDate.getTime() - curDate.getTime();
    const msInDays = 24 * 60 * 60 * 1000;
    return Math.ceil(diffMs / msInDays);
}

// Маппер для дедлайнов
export function mapDeadlineShort(api: ApiDeadlineShort) {
    return {
        id: api.id,
        subject: api.subject.name,
        workType: api.task_type,
        deadline: new Date(api.deadline).toLocaleDateString("ru-RU"), // Превращаем в "18.06.2026"
        daysLeft: getRemainingDays(api.deadline),
        cardIcon: api.icon || "📌",
        shortDescription: api.short_description|| "Без описания",
        isCompleted: api.is_completed
    };
}
export function mapDeadlineFull(api: ApiDeadlineFull) {
    return {
        ...mapDeadlineShort(api),
        task: api.task,
        group_id: api.group_id,
    };
}

// Маппер для проектов
export function mapProjectShort(api: ApiProjectShort) {
    return {
        id: api.id,
        name: api.name, // TODO: Добавить срез
        subject: api.subject.name,
        workType: "Проект",
        deadline: new Date(api.deadline).toLocaleDateString("ru-RU"),
        daysLeft:getRemainingDays(api.deadline),
        cardIcon: api.icon || "⚡",
        users: (api.project_group || []).map(member => ({
            uid: member.user_id,
            username: member.user_name,
            avaUrl: member.avatar_url
        })),
        progress_percent: api.progress_percent
    };
}