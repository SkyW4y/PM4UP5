import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeaderSlot, ButtonsSlot, RightControlSlot } from "../components/LayoutSlots.tsx";
import NavButton from "../components/NavButton.tsx";
import DetailModal from "../components/DetailModal.tsx";
import { subjectsApi, dashboardApi } from "../api/api.ts";
import { type UiDeadline } from "../api/mappers.ts";

import "../styles/subject-detail-page.css";

const convertRuDateToIso = (ruDate: string): string => {
    const parts = ruDate.split(".");
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return "";
};

export default function SubjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<UiDeadline[]>([]);
    const [subjectName, setSubjectName] = useState<string>("Загрузка...");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});

    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<UiDeadline | null>(null);

    const [formShortDesc, setFormShortDesc] = useState("");
    const [formDetail, setFormDetail] = useState("");
    const [formDeadline, setFormDeadline] = useState("");
    const [formType, setFormType] = useState<'homework' | 'classwork' | 'project'>("homework");
    const [formClass, setFormClass] = useState<'solo' | 'group'>("solo");

    const loadSubjectData = async () => {
        try {
            setIsLoading(true);
            const allDeadlines = await dashboardApi.getDeadlines(0, 100);
            const filteredShortTasks = allDeadlines.filter(
                (task) => task.subjectId === Number(id)
            );

            setTasks(filteredShortTasks);
            setIsLoading(false);

            if (filteredShortTasks.length > 0 && filteredShortTasks[0].subject) {
                setSubjectName(filteredShortTasks[0].subject);
            } else {
                const allSubjects = await subjectsApi.getSubjects();
                const currentSubject = allSubjects.find(s => s.id === Number(id));
                setSubjectName(currentSubject ? currentSubject.name : `Предмет ID: ${id}`);
            }

            for (const shortTask of filteredShortTasks) {
                try {
                    const fullTask = await dashboardApi.getDeadlineById(shortTask.id);
                    setTasks(prevTasks =>
                        prevTasks.map(t => t.id === shortTask.id ? fullTask : t)
                    );
                } catch (err) {
                    console.error(`Не удалось догрузить детали для ID ${shortTask.id}:`, err);
                }
            }
        } catch (error) {
            console.error("Ошибка при загрузке деталей предмета:", error);
            setSubjectName("Ошибка загрузки");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadSubjectData();
    }, [id]);

    const resetForm = () => {
        setFormShortDesc("");
        setFormDetail("");
        setFormDeadline("");
        setFormType("homework");
        setFormClass("solo");
        setSelectedTask(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsCreateOpen(true);
    };

    const openEditModal = (task: UiDeadline) => {
        setSelectedTask(task);
        setFormShortDesc(task.shortDescription);
        setFormDetail(task.taskDetail || "");
        setFormDeadline(convertRuDateToIso(task.deadlineStr));
        setFormType(task.workType);
        setFormClass(task.taskClass);
        setIsEditOpen(true);
    };

   const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            const newTask = await subjectsApi.createTaskForSubject({
                task: formDetail,
                short_description: formShortDesc,
                deadline: formDeadline,
                subject_id: Number(id),
                task_class: formClass,
                task_type: formType
            });

            setTasks(prev => [...prev, newTask]);
            setIsCreateOpen(false);
            resetForm();
        } catch (error) {
            console.error("Ошибка создания задачи:", error);
        }
    };

   const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask) return;

        try {
            const updatedTaskPayload = {
                id: selectedTask.id,
                task: formDetail,
                short_description: formShortDesc,
                deadline: formDeadline,
                task_class: formClass,
                task_type: formType,
                is_completed: selectedTask.isCompleted
            };

            await subjectsApi.patchSubjectDelta(Number(id), {
                tasks: [updatedTaskPayload]
            });

            setTasks(prev => prev.map(t => t.id === selectedTask.id ? {
                ...t,
                shortDescription: formShortDesc,
                taskDetail: formDetail,
                deadlineStr: new Date(formDeadline).toLocaleDateString("ru-RU"),
                workType: formType,
                taskClass: formClass
            } : t));

            setIsEditOpen(false);
            resetForm();
        } catch (error) {
            console.error("Ошибка обновления задачи:", error);
        }
    };

    const handleToggleStatus = async (taskId: number, currentStatus: boolean) => {
        const nextStatus = !currentStatus;
        try {
            setTasks(prev =>
                prev.map(t => t.id === taskId ? { ...t, isCompleted: nextStatus } : t)
            );
            await subjectsApi.toggleTaskStatus(taskId, nextStatus);
        } catch (error) {
            console.error("Не удалось обновить статус задачи:", error);
            setTasks(prev =>
                prev.map(t => t.id === taskId ? { ...t, isCompleted: currentStatus } : t)
            );
        }
    };

    const toggleExpandTask = (taskId: number) => {
        setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const handleAttachmentClick = (e: React.MouseEvent, taskTitle: string) => {
        e.stopPropagation();
        alert(`Тут будут вложения для задачи: "${taskTitle}"`);
    };

    const getDaysLeftText = (daysLeft: number) => {
        if (daysLeft < 0) return `просрочено на ${Math.abs(daysLeft)}д`;
        if (daysLeft === 0) return "сегодня!";
        return `осталось: ${daysLeft}д`;
    };

    const typeLabels = { homework: "ДЗ", classwork: "Очно", project: "Проект" };
    const classLabels = { solo: "Одиночное", group: "Командное" };

    return (
        <>
            <HeaderSlot>
                {subjectName}
            </HeaderSlot>

            <RightControlSlot>
                <button onClick={openCreateModal} className="create-task-btn" style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(255,255,255,0.15)",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "14px",
                        backdropFilter: "blur(10px)"
                    }}>
                    + Создать
                </button>
                <button onClick={() => navigate("/subject")} className="back-arrow-btn" >
                    ←
                </button>
            </RightControlSlot>

            <ButtonsSlot>
                <NavButton isActive={false} link={"/"} icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-view-stacked" viewBox="0 0 16 16"><path d="M3 0h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm0 8h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/></svg>}/>
                <NavButton isActive={false} link={"/projects"} icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-kanban-fill" viewBox="0 0 16 16"><path d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1"/></svg>}/>
                <NavButton isActive={true} link={"/subject"} icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-journal-bookmark-fill" viewBox="0 0 16 16"><path fillRule="evenodd" d="M6 1h6v7a.5.5 0 0 1-.757.429L9 7.083 6.757 8.43A.5.5 0 0 1 6 8z"/><path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/><path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/></svg>}/>
            </ButtonsSlot>

            <div className="tasksListContainer">
                {isLoading ? (
                    <p className="statusText">Загрузка списка заданий...</p>
                ) : tasks.length === 0 ? (
                    <p className="statusText">Заданий по этому предмету пока нет.</p>
                ) : (
                    tasks.map(task => {
                        const isExpanded = !!expandedTasks[task.id];

                        return (
                            <div key={task.id} className="taskSchemaRow">
                                <div className="taskSchemaTop">
                                    <span className="taskShortDescription">{task.shortDescription || "Без описания"}</span>
                                    <div className="taskBadges">
                                        <span className="badgeType">{typeLabels[task.workType] || task.workType}</span>
                                        <span className="badgeClass">{classLabels[task.taskClass] || task.taskClass}</span>
                                    </div>
                                    <label className="taskCheckboxLabel">
                                        Выполнено:
                                        <input
                                            type="checkbox"
                                            checked={task.isCompleted}
                                            onChange={() => handleToggleStatus(task.id, task.isCompleted)}
                                        />
                                    </label>

                                    <button
                                        className="edit-row-btn"
                                        onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                                        style={{ marginLeft: "10px", background: "none", border: "none", cursor: "pointer" }}
                                    >
                                        ✏️
                                    </button>
                                </div>

                                <div
                                    className="taskSchemaMiddle"
                                    onClick={() => toggleExpandTask(task.id)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className={`taskMainContent ${isExpanded ? "expanded" : "collapsed"}`}>
                                        {task.taskDetail || "Текст задания отсутствует"}
                                    </div>

                                    <div className="taskMiddleControls">
                                        <span
                                            className="taskArrowIcon"
                                            style={{
                                                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                                display: "inline-block",
                                                transition: "transform 0.2s"
                                            }}
                                        >
                                            ▼
                                        </span>
                                        <span
                                            className="taskAttachmentIcon"
                                            onClick={(e) => handleAttachmentClick(e, task.shortDescription)}
                                        >
                                            📎
                                        </span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="taskExpandedDetails" style={{
                                        padding: "10px",
                                        background: "rgba(0,0,0,0.15)",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        color: "rgba(255,255,255,0.8)"
                                    }}>
                                        Уникальный ID задачи: <strong>{task.id}</strong>.
                                        Используйте раздел проектов для командной работы по этой задаче.
                                    </div>
                                )}

                                <div className="taskSchemaBottom">
                                    <span className="taskDeadlineDate">Сдать: {task.deadlineStr}</span>
                                    <span className="taskDaysLeft">{getDaysLeftText(task.daysLeft)}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {isCreateOpen && (
                <DetailModal title="Создание нового задания" onClose={() => setIsCreateOpen(false)}>
                    <form onSubmit={handleCreateSubmit} className="modal-form-layout">
                        <div className="form-group">
                            <label>Краткое описание:</label>
                            <input
                                type="text"
                                value={formShortDesc}
                                onChange={e => setFormShortDesc(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Полный текст задания:</label>
                            <textarea
                                value={formDetail}
                                onChange={e => setFormDetail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Дедлайн:</label>
                            <input
                                type="date"
                                value={formDeadline}
                                onChange={e => setFormDeadline(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Тип работы:</label>
                                <select value={formType} onChange={e => setFormType(e.target.value as any)}>
                                    <option value="homework">ДЗ</option>
                                    <option value="classwork">Очно</option>
                                    <option value="project">Проект</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Класс задачи:</label>
                                <select value={formClass} onChange={e => setFormClass(e.target.value as any)}>
                                    <option value="solo">Одиночное</option>
                                    <option value="group">Командное</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-form-actions">
                            <button type="button" onClick={() => setIsCreateOpen(false)}>Отмена</button>
                            <button type="submit" className="submit-btn">Создать</button>
                        </div>
                    </form>
                </DetailModal>
            )}

            {isEditOpen && (
                <DetailModal title="Редактирование задания" onClose={() => setIsEditOpen(false)}>
                    <form onSubmit={handleEditSubmit} className="modal-form-layout">
                        <div className="form-group">
                            <label>Краткое описание:</label>
                            <input
                                type="text"
                                value={formShortDesc}
                                onChange={e => setFormShortDesc(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Полный текст задания:</label>
                            <textarea
                                value={formDetail}
                                onChange={e => setFormDetail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Дедлайн:</label>
                            <input
                                type="date"
                                value={formDeadline}
                                onChange={e => setFormDeadline(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Тип работы:</label>
                                <select value={formType} onChange={e => setFormType(e.target.value as any)}>
                                    <option value="homework">ДЗ</option>
                                    <option value="classwork">Очно</option>
                                    <option value="project">Проект</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Класс задачи:</label>
                                <select value={formClass} onChange={e => setFormClass(e.target.value as any)}>
                                    <option value="solo">Одиночное</option>
                                    <option value="group">Командное</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-form-actions">
                            <button type="button" onClick={() => setIsEditOpen(false)}>Отмена</button>
                            <button type="submit" className="submit-btn save-btn">Сохранить изменения</button>
                        </div>
                    </form>
                </DetailModal>
            )}
        </>
    );
}