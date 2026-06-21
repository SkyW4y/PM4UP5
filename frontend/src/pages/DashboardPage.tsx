import { useState, useEffect } from "react";
import { dashboardApi } from "../api/dashboard.ts";

import DashboardColumn from "../components/DashboardColumn.tsx";
import HeaderSlot from "../components/LayoutSlots.tsx";
import ColumnCardBase from "../components/ColumnCardBase.tsx";
import DashboardProjectCard from "../components/DashboardProjectCard.tsx";
import DashboardDeadlineModal from "../components/DashboardDeadlineModal.tsx";

import { useDeadlineModal } from "../hooks/useDeadlineModal.ts";

function onProjectAddClick() {
    alert("Add Project");
}

type DeadlineItem = Awaited<ReturnType<typeof dashboardApi.getDeadlines>>[number];
type ProjectItem = Awaited<ReturnType<typeof dashboardApi.getProjects>>[number];

// function onCardClick() {
//     alert("Card"); //da
// }

export default function DashboardPage() {
    const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshDeadlines = () => {
        dashboardApi.getDeadlines().then((data) => setDeadlines(data));
    };

    const {
        isOpen,
        isLoading: isModalLoading,
        deadlineData,
        openModal,
        closeModal,
        toggleComplete
    } = useDeadlineModal(refreshDeadlines);


    useEffect(() => {
       dashboardApi.getDeadlines().then((data) => {
           setDeadlines(data);
           setLoading(false);
       })
       .catch((err) => {
           setError(err.message);
           setLoading(false);
       });
    }, []);
    useEffect(() => {
       dashboardApi.getProjects().then((data) => {
           setProjects(data);
           setLoading(false);
       })
       .catch((err) => {
           setError(err.message);
           setLoading(false);
       });
    }, []);
    if (loading) {
        return (
            <div>Загрузка...</div>
        );
    }
    if (error) {
        return (
            <div>Ошибка ${error}</div>
        );
    }

    return (
        <>
            <HeaderSlot>
                {"Dashboard"}
            </HeaderSlot>
            <DashboardColumn title={"Ближайшие дедлайны"}>
                {deadlines.map((item) => (
                    <ColumnCardBase
                        key={item.id}
                        subject={item.subject}
                        workType={item.workType}
                        deadline={item.deadline}
                        daysLeft={item.daysLeft}
                        cardIcon={item.cardIcon}
                        shortDescription={item.shortDescription}
                        onClick={() => openModal(item.id)}
                    />
                ))}
            </DashboardColumn>
            <DashboardColumn title={"Групповые проекты"} onAddClick={onProjectAddClick}>
                {projects.map((item) => (
                    <DashboardProjectCard
                        key={item.id}
                        subject={item.subject}
                        daysLeft={item.daysLeft}
                        cardIcon={item.cardIcon}
                        shortName={item.name}
                        progress={item.progress_percent}
                        deadline={item.deadline}
                        users={item.users.map((user) => user.avaUrl)}
                    />
                ))}
            </DashboardColumn>

            {isOpen && (
                <DashboardDeadlineModal
                    isLoading={isModalLoading}
                    data={deadlineData}
                    onClose={closeModal}
                    onChecked={toggleComplete}
                />
            )}
        </>
    );
}