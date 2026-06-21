import { useState } from "react";
import { dashboardApi } from "../api/dashboard.ts";

export interface DetailedDeadline {
    id: number;
    task: string;
    task_type: string;
    deadline: string;
    is_completed: boolean;
    shortDescription: string;
    daysLeft: number;
}

export function useDeadlineModal(onrefreshData?: () => void) {
    const [activeId, setActiveId] = useState<number | null>(null);
    const [data, setData] = useState<DetailedDeadline | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const openModal = async (id: number) => {
        setActiveId(id);
        setIsLoading(true);
        setData(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 600)); // имитация загрузки

            await dashboardApi.getDeadlineById(id).then((data) => {
               setData({
                    id: id,
                    task: data.task,
                    task_type: data.workType,
                    deadline: data.deadline,
                    is_completed: data.isCompleted,
                    daysLeft: data.daysLeft,
                    shortDescription: data.shortDescription
                });
            })
        } catch (error) {
            console.error("Error while loading modal details:", error);
            closeModal();
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setActiveId(null);
        setData(null);
    };

    const toggleComplete = async () => {
        if (!data) return;

        const previousStatus = data.is_completed;
        setData({ ...data, is_completed: !previousStatus });

        try {
            // TODO: эндпоинт обновления

            console.log(`Task status ${data.id} succesfull changed to:`, !previousStatus);

            // Обновление списка в дашборде
            if (onrefreshData) onrefreshData();
        } catch (error) {
            console.error("Couldn`t update status on backend:", error);
            setData({ ...data, is_completed: previousStatus });
        }
    };

    return {
        isOpen: activeId !== null,
        isLoading,
        deadlineData: data,
        openModal,
        closeModal,
        toggleComplete
    };
}