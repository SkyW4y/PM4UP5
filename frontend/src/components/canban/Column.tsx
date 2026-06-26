import React, { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import * as M from "../../api/mappers";
import { projectsApi } from "../../api/api.ts";
import KanbanCard from "./Card";

interface ColumnProps {
    column: M.UiColumn;
    index: number;
    cards: M.UiCard[];
    setCards: React.Dispatch<React.SetStateAction<M.UiCard[]>>;
    onDeleteColumn: (id: number) => void;
    projectId: number;
    projectMembers: any[];
}

export default function KanbanColumn({ column, index, cards, setCards, onDeleteColumn, projectId, projectMembers }: ColumnProps) {
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState("");

    const submitNewCard = async () => {
        const trimmed = newCardTitle.trim();
        if (!trimmed) {
            setIsCreatingCard(false);
            return;
        }
        try {
            const newCard = await projectsApi.createCard(projectId, column.id, { title: trimmed });
            setCards(prev => [...prev, newCard]);
        } catch (e) { console.error(e); }
        setNewCardTitle("");
        setIsCreatingCard(false);
    };

    return (
        <Draggable draggableId={String(column.id)} index={index}>
            {(provided) => (
                <div className="column-container" ref={provided.innerRef} {...provided.draggableProps}>
                    <div className="column-header" {...provided.dragHandleProps}>
                        <div className="column-title-zone">
                            <span className="column-title">{column.name}</span>
                            <span className="column-counter">{cards.length}</span>
                        </div>
                        <div className="column-menu-btn" onClick={() => onDeleteColumn(column.id)}>•••</div>
                    </div>

                    <Droppable droppableId={String(column.id)} type="card">
                        {(dropProvided, dropSnapshot) => (
                            <div
                                className={`column-task-list ${dropSnapshot.isDraggingOver ? "list-dragging-over" : ""}`}
                                ref={dropProvided.innerRef}
                                {...dropProvided.droppableProps}
                            >
                                {cards.map((card, cardIndex) => (
                                    <KanbanCard
                                        key={card.id}
                                        card={card}
                                        index={cardIndex}
                                        setCards={setCards}
                                        projectId={projectId}
                                        projectMembers={projectMembers}
                                    />
                                ))}
                                {dropProvided.placeholder}

                                {isCreatingCard && (
                                    <div className="task-card dummy-card">
                                        <input
                                            type="text"
                                            className="inline-element-input card-input"
                                            placeholder="Текст карточки..."
                                            autoFocus
                                            value={newCardTitle}
                                            onChange={(e) => setNewCardTitle(e.target.value)}
                                            onBlur={submitNewCard}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") submitNewCard();
                                                if (e.key === "Escape") setIsCreatingCard(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </Droppable>

                    <div className="column-footer">
                        <button className="add-task-btn" onClick={() => setIsCreatingCard(true)}>
                            <span className="add-task-icon">+</span>
                            <span className="add-task-text">Добавить карточку</span>
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
}