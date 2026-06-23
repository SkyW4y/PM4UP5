// ===========================================================================
//                    Сгенерированно нейронкой
// ===========================================================================


import type { ApiDeadlineShort, ApiDeadlineFull, ApiProjectShort } from "./mappers.ts";

// ============================================================================
// 1. МАКЕТЫ ДЛЯ ДЕДЛАЙНОВ (Ближайшие дедлайны)
// ============================================================================

// Список коротких дедлайнов (для колонки)
export const mockApiDeadlinesShort: ApiDeadlineShort[] = [
    {
        id: 1,
        task_class: "Лабораторная работа",
        task_type: "ДЗ",
        short_description: "Сдать лабу №3 по ООП и закоммитить в реп",
        deadline: "2026-06-24", // ISO формат от бэка (удобно парсить)
        subject: {
            id: 10,
            name: "C++ и Архитектура ПО",
            group_id: 4
        },
        is_completed: false,
        icon: "🐧"
    },
    {
        id: 2,
        task_class: "Практическое занятие",
        task_type: "Семинар",
        short_description: "Заполнить отчет по педагогической практике в саду",
        deadline: "2026-06-22T18:00:00Z",
        subject: {
            id: 11,
            name: "Педагогика и психология",
            group_id: 4
        },
        is_completed: false,
        icon: "🧸"
    },
    {
        id: 3,
        task_class: "Курсовая работа",
        task_type: "КР",
        short_description: "Написать пояснительную записку (минимум 25 страниц)",
        deadline: "2026-06-28T12:00:00Z",
        subject: {
            id: 12,
            name: "Базы Данных (SQL)",
            group_id: 4
        },
        is_completed: false,
        icon: "🗄️"
    },
    {
        id: 4,
        task_class: "Тестирование",
        task_type: "Контрольная",
        short_description: "Пройти тест на платформе по сетям Cisco",
        deadline: "2026-06-18T09:00:00Z",
        subject: {
            id: 13,
            name: "Компьютерные сети",
            group_id: 4
        },
        is_completed: true, // Этот уже выполнен, можно проверить фильтрацию
        icon: "🌐"
    },
    {
        id: 5,
        task_class: "Домашнее задание",
        task_type: "ДЗ",
        short_description: "Развернуть Docker-контейнер с FastAPI бэком",
        deadline: "2026-06-25T21:00:00Z",
        subject: {
            id: 14,
            name: "Инструменты разработки (DevOps)",
            group_id: 4
        },
        is_completed: false,
        icon: "🐋"
    }
];

// Полная информация по дедлайнам (для детального просмотра/модалок)
export const mockApiDeadlinesFull: Record<number, ApiDeadlineFull> = {
    1: {
        ...mockApiDeadlinesShort[0],
        task: "Необходимо реализовать паттерн 'Фабрика' и 'Наблюдатель' для игрового движка на SFML. Код должен компилироваться под Ubuntu 26.04 без костылей. Ссылку на гитхаб кидать в ЛК.",
        group_id: 4
    },
    2: {
        ...mockApiDeadlinesShort[1],
        task: "Оформить дневник практики. Расписать по дням проведение развивающих игр с детьми старшей группы. Поставить подпись у заведующей детского сада.",
        group_id: 4
    },
    3: {
        ...mockApiDeadlinesShort[2],
        task: "Разработать схему БД для проката электровелосипедов (ERP система). Спроектировать таблицы: пользователи, велосипеды, сессии проката, транзакции. Оптимизировать индексы.",
        group_id: 4
    },
    4: {
        ...mockApiDeadlinesShort[3],
        task: "Итоговый тест по 3 модулю курса Cisco: Маршрутизация и коммутация. Ограничение по времени 45 минут, 30 вопросов.",
        group_id: 4
    },
    5: {
        ...mockApiDeadlinesShort[4],
        task: "Написать Dockerfile для FastAPI приложения, настроить docker-compose.yml с прокидыванием портов и волюмами для локальной разработки. Убедиться, что node_modules не засирает хост! 😉",
        group_id: 4
    }
};

// ============================================================================
// 2. МАКЕТЫ ДЛЯ ПРОЕКТОВ (Групповые проекты)
// ============================================================================

export const mockApiProjectsShort: ApiProjectShort[] = [
    {
        id: 101,
        name: "Разработка Dashboard (PM4UP5)",
        deadline: "2026-06-30T23:59:59Z",
        icon: "⚡",
        group_id: 4,
        progress_percent: 45,
        subject: {
            id: 15,
            name: "Технологии веб-разработки",
            group_id: 4
        },
        project_group: [
            {
                user_id: 11,
                user_name: "skyw4y",
                avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=skyw4y"
            },
            {
                user_id: 12,
                user_name: "gondonio",
                avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=gondonio"
            },
            {
                user_id: 13,
                user_name: "liza_j",
                avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=liza"
            }
        ]
    },
    {
        id: 102,
        name: "Собственный RPG Движок на SFML",
        deadline: "2026-07-15T18:00:00Z",
        icon: "⚔️",
        group_id: 4,
        progress_percent: 15,
        subject: {
            id: 10,
            name: "C++ и Архитектура ПО",
            group_id: 4
        },
        project_group: [
            {
                user_id: 11,
                user_name: "skyw4y",
                avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=skyw4y"
            },
            {
                user_id: 14,
                user_name: "alex_cpp",
                avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=alex"
            }
        ]
    },
    {
        id: 103,
        name: "Автоматизация проката Электровелов",
        deadline: "2026-06-29T00:00:00Z",
        icon: "🚲",
        group_id: 4,
        progress_percent: 80,
        subject: {
            id: 12,
            name: "Базы Данных (SQL)",
            group_id: 4
        },
        project_group: [
            {
                user_id: 15,
                user_name: "manager_ivan",
                avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=ivan"
            },
            {
                user_id: 11,
                user_name: "skyw4y",
                avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=skyw4y"
            }
        ]
    }
];