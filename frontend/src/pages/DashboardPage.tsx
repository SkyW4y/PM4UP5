import { useState, useEffect } from "react";
import { dashboardApi } from "../api/dashboard.ts";

import DashboardColumn from "../components/DashboardColumn.tsx";
import HeaderSlot from "../components/LayoutSlots.tsx";
import ColumnCardBase from "../components/ColumnCardBase.tsx";
import DashboardProjectCard from "../components/DashboardProjectCard.tsx";
import DetailModal from "../components/DetailModal.tsx";

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

    const [activeDeadlineId, setActiveDeadlineId] = useState<number | null>(null);
    const [modalData, setModalData] = useState<any | null>(null); // TODO: пофиксить any
    const [isModalLoading, setModalIsLoading] = useState(false);

    const handleCardClick = async (id: number) => {
        setActiveDeadlineId(id); // Модалка моментально монтируется в DOM
        setModalIsLoading(true);      // Включаем лоадер внутри неё
        setModalData(null);      // Сбрасываем старые данные

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setModalData({
                task: "Курсовая работа",
                description: "Полное ТЗ: фцвфцвфцв",
            });
        } catch (error) {
            console.error("Ошибка загрузки дедлайна", error);
        } finally {
            setModalIsLoading(false);
        }
    };

    // Функция закрытия (полностью деструктит модалку)
    const handleCloseModal = () => {
        setActiveDeadlineId(null);
        setModalData(null);
    };

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
                        onClick={() => handleCardClick(item.id)}
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
            {activeDeadlineId !== null && (
                <DetailModal
                    title={isModalLoading ? "Загрузка..." : modalData?.task || "Детали задачи"}
                    onClose={handleCloseModal}
                >
                    {isModalLoading ? (
                        // Красивый лоадер или скелетон, пока ждем ответ от API
                        <div className="modal-loader">
                            <div className="spinner"></div>
                            <p>Запрашиваю данные у бэкенда...</p>
                        </div>
                    ) : (
                        // Данные пришли — рендерим детей!
                        <div className="modal-real-content">
                            <p className="full-description">{modalData?.description}</p>
                            <div className="modal-status">
                                Status: <span className="status-badge">In Progress</span>
                            </div>
                        </div>
                    )}
                </DetailModal>
            )}
        </>
    );
}

// TODO: Доделать стили.