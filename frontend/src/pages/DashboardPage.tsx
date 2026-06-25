import { useState, useEffect } from "react";
import { dashboardApi } from "../api/api.ts";

import DashboardColumn from "../components/DashboardColumn.tsx";
import { HeaderSlot, ButtonsSlot } from "../components/LayoutSlots.tsx";
import ColumnCardBase from "../components/ColumnCardBase.tsx";
import DashboardProjectCard from "../components/DashboardProjectCard.tsx";
import DashboardDeadlineModal from "../components/DashboardDeadlineModal.tsx";
import NavButton from "../components/NavButton.tsx";
import { useDeadlineModal } from "../hooks/useDeadlineModal.ts";
import MiniCalendar from "../components/MiniCalendar.tsx";
import ProgressPieChart from "../components/ProgressPieChart.tsx";

function onProjectAddClick() {
    alert("Add Project");
}

import "../styles/dashboard-page.css"

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
            <ButtonsSlot>
                <NavButton isActive={true} link={"/dashboard"} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                         className="bi bi-view-stacked" viewBox="0 0 16 16">
                        <path
                            d="M3 0h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm0 8h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                    </svg>
                }/>
                <NavButton isActive={false} link={"/projects"} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                         className="bi bi-kanban-fill" viewBox="0 0 16 16">
                        <path
                            d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1"/>
                    </svg>
                }/>
                <NavButton isActive={false} link={"/subject"} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-journal-bookmark-fill" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M6 1h6v7a.5.5 0 0 1-.757.429L9 7.083 6.757 8.43A.5.5 0 0 1 6 8z"/>
                      <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
                      <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/>
                    </svg>
                }/>
            </ButtonsSlot>
            <DashboardColumn title={"Ближайшие дедлайны"}>
                {deadlines.map((item) => (
                    <ColumnCardBase
                        key={item.id}
                        subject={item.subject}
                        workType={item.workType}
                        deadline={item.deadlineStr}
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
                        progress={item.progressPercent}
                        deadline={item.deadlineStr}
                        users={item.members.map((user) => user.avaUrl)}
                    />
                ))}
            </DashboardColumn>
            <div className="dashboard-right-panel">
                <div className="dashboard-stats">
                    <ProgressPieChart percentCompleted={30}/>
                    <ProgressPieChart percentCompleted={60}/>
                </div>
                <MiniCalendar deadlines={deadlines} projects={projects}
                    onDayClick={(taskId) => openModal(taskId)}
                />
            </div>
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