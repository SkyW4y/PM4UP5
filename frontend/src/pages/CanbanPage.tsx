import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd";

import { HeaderSlot, ButtonsSlot } from "../components/LayoutSlots.tsx";
import NavButton from "../components/NavButton.tsx";
import KanbanColumn from "../components/canban/Column";
import { projectsApi } from "../api/api.ts";
import * as M from "../api/mappers.ts";

import "../styles/canban-page.css";

export default function CanbanPage() {
    const { id } = useParams<{ id: string }>();
    const projectId = Number(id || 1);

    const [columns, setColumns] = useState<M.UiColumn[]>([]);
    const [cards, setCards] = useState<M.UiCard[]>([]);
    const [projectData, setProjectData] = useState<M.UiProjectFull | null>(null);
    const [loading, setLoading] = useState(true);

    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");

    useEffect(() => {
        const fetchBoardData = async () => {
            try {
                setLoading(true);
                const data = await projectsApi.getById(projectId);
                setProjectData(data);

                const flatColumns = data.columns.map(({ cards, ...col }) => ({ ...col, cards: [] }));
                setColumns(flatColumns.sort((a, b) => a.position - b.position));
                setCards(data.columns.flatMap(col => col.cards));
            } catch (error) {
                console.error("Ошибка при загрузке доски:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBoardData();
    }, [projectId]);

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, type } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        if (type === "column") {
            const reorderedCols = Array.from(columns);
            const [removed] = reorderedCols.splice(source.index, 1);
            reorderedCols.splice(destination.index, 0, removed);
            const updatedCols = reorderedCols.map((col, idx) => ({ ...col, position: idx }));
            setColumns(updatedCols);
            await projectsApi.patchDelta(projectId, { columns: updatedCols.map(c => ({ id: c.id, position: c.position })) });
            return;
        }

        const sourceColId = Number(source.droppableId);
        const destColId = Number(destination.droppableId);


        const sourceColumnCards = cards.filter(c => c.columnId === sourceColId).sort((a, b) => a.position - b.position);
        const destColumnCards = cards.filter(c => c.columnId === destColId).sort((a, b) => a.position - b.position);

        if (sourceColId === destColId) {
            const [movedCard] = sourceColumnCards.splice(source.index, 1);
            sourceColumnCards.splice(destination.index, 0, movedCard);

            const updatedColumnCards = sourceColumnCards.map((c, idx) => ({ ...c, position: idx }));

            setCards(prev => {
                const clean = prev.filter(c => c.columnId !== sourceColId);
                return [...clean, ...updatedColumnCards];
            });

            try {
                await projectsApi.patchDelta(projectId, {
                    cards: updatedColumnCards.map(c => ({ id: c.id, column_id: c.columnId, position: c.position }))
                });
            } catch (e) { console.error(e); }
        } else {
            const [movedCard] = sourceColumnCards.splice(source.index, 1);

            const updatedMovedCard = { ...movedCard, columnId: destColId };
            destColumnCards.splice(destination.index, 0, updatedMovedCard);

            const updatedSourceCards = sourceColumnCards.map((c, idx) => ({ ...c, position: idx }));
            const updatedDestCards = destColumnCards.map((c, idx) => ({ ...c, position: idx }));
            const affectedCards = [...updatedSourceCards, ...updatedDestCards];

            setCards(prev => {
                const clean = prev.filter(c => c.columnId !== sourceColId && c.columnId !== destColId);
                return [...clean, ...affectedCards];
            });

            try {
                await projectsApi.patchDelta(projectId, {
                    cards: affectedCards.map(c => ({ id: c.id, column_id: c.columnId, position: c.position }))
                });
            } catch (e) { console.error(e); }
        }
    };

    const submitNewColumn = async () => {
        const trimmed = newColumnName.trim();
        if (!trimmed) {
            setIsCreatingColumn(false);
            return;
        }
        try {
            const apiCol = await projectsApi.createColumn(projectId, { name: trimmed });
            setColumns(prev => [...prev, { id: apiCol.id, name: apiCol.name, position: apiCol.position, projectId: apiCol.project_id, cards: [] }]);
        } catch (e) { console.error(e); }
        setNewColumnName("");
        setIsCreatingColumn(false);
    };

    const handleDeleteColumn = async (columnId: number) => {
        if (!confirm("Удалить колонку?")) return;
        try {
            await projectsApi.deleteColumn(columnId);
            setColumns(prev => prev.filter(c => c.id !== columnId));
            setCards(prev => prev.filter(c => c.columnId !== columnId));
        } catch (e) { console.error(e); }
    };

    return (
        <>
            <HeaderSlot>{loading ? "Загрузка проекта..." : `${projectData?.name} | задачи`}</HeaderSlot>
            <ButtonsSlot>
                <NavButton isActive={false} link={"/"} icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="M3 0h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm0 8h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/></svg>}/>
                <NavButton isActive={true} link={"/projects"} icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1"/></svg>}/>
            </ButtonsSlot>

            <div className="kanban-page-content">
                <div className="kanban-board-sub-header">
                    <button onClick={() => setIsCreatingColumn(true)} className="add-column-top-btn">+ Добавить столбец</button>
                    <div className="project-members-list">
                        {projectData?.projectGroup.map(user => (
                            <img key={user.id} src={user.avatar || "/default-avatar.png"} alt={user.username} className="member-avatar-circle" />
                        ))}
                    </div>
                </div>

                <div className="kanban-board-scroll-wrapper">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="all-columns" direction="horizontal" type="column">
                            {(provided) => (
                                <div className="kanban-columns-container" ref={provided.innerRef} {...provided.droppableProps}>
                                    {columns.map((column, index) => (
                                        <KanbanColumn
                                            key={column.id}
                                            column={column}
                                            index={index}
                                            cards={cards.filter(c => c.columnId === column.id).sort((a, b) => a.position - b.position)}
                                            setCards={setCards}
                                            onDeleteColumn={handleDeleteColumn}
                                            projectId={projectId}
                                            projectMembers={projectData?.projectGroup ? projectData?.projectGroup : []}
                                        />
                                    ))}
                                    {provided.placeholder}

                                    {isCreatingColumn && (
                                        <div className="column-container dummy-column">
                                            <div className="column-header">
                                                <input
                                                    type="text"
                                                    className="inline-element-input"
                                                    placeholder="Название колонки..."
                                                    autoFocus
                                                    value={newColumnName}
                                                    onChange={(e) => setNewColumnName(e.target.value)}
                                                    onBlur={submitNewColumn}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") submitNewColumn();
                                                        if (e.key === "Escape") setIsCreatingColumn(false);
                                                    }}
                                                />
                                            </div>
                                            <div className="column-task-list"></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>
        </>
    );
}