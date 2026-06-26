import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Draggable } from "@hello-pangea/dnd";
import * as M from "../../api/mappers";
import { projectsApi } from "../../api/api";

import "../../styles/canban-card.css";

interface CardProps {
    card: M.UiCard;
    index: number;
    projectId: number;
    projectMembers: any[];
    setCards: React.Dispatch<React.SetStateAction<M.UiCard[]>>;
    onEditClick?: (card: M.UiCard) => void;
}

export default function KanbanCard({ card, index, projectId, projectMembers, setCards, onEditClick }: CardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [popoverCoords, setPopoverCoords] = useState({ top: 0, left: 0 });

    const cardRef = useRef<HTMLDivElement | null>(null);

    const updateCardFields = async (updatedFields: Partial<M.UiCard>) => {
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, ...updatedFields } : c));

    const apiCardDelta: any = { id: card.id };

    if ('color' in updatedFields) {
        apiCardDelta.color = updatedFields.color;
    }

    if ('responsibleUser' in updatedFields) {
        apiCardDelta.responsible_id = updatedFields.responsibleUser?.id ?? null;

    }

    if ('title' in updatedFields) apiCardDelta.title = updatedFields.title;
    if ('description' in updatedFields) apiCardDelta.description = updatedFields.description;
    if ('deadline' in updatedFields) apiCardDelta.deadline = updatedFields.deadline;

    try {
        console.log([apiCardDelta]);
        await projectsApi.patchDelta(projectId, {
            cards: [apiCardDelta]
        });
    } catch (error) {
        console.error("Ошибка при сохранении карточки:", error);
    }
};

    const toggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateCardFields({ isCompleted: !card.isCompleted });
    };

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMenuOpen) {
            setIsMenuOpen(false);
            setIsUserListOpen(false);
        } else if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setPopoverCoords({
                top: rect.top + window.scrollY,
                left: rect.right + window.scrollX + 12
            });
            setIsMenuOpen(true);
        }
    };

    useEffect(() => {
        if (!isMenuOpen) return;
        const handleOutsideClick = () => {
            setIsMenuOpen(false);
            setIsUserListOpen(false);
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, [isMenuOpen]);

    return (
        <Draggable draggableId={String(card.id)} index={index}>
            {(provided, snapshot) => {
                const handleRef = (node: HTMLDivElement | null) => {
                    cardRef.current = node;
                    provided.innerRef(node);
                };

                const cardElement = (
                    <div
                        className={`task-card ${snapshot.isDragging ? "card-dragging" : ""} ${card.isCompleted ? "task-completed" : ""}`}
                        ref={handleRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                            ...provided.draggableProps.style,
                            borderTop: card.color ? `6px solid ${card.color}` : "none"
                        }}
                    >
                        <button
                            className={`card-edit-trigger-btn ${isMenuOpen ? "active" : ""}`}
                            onClick={toggleMenu}
                            title="Настройки карточки"
                        >
                            ✏️
                        </button>

                        <div className="card-row-layout">
                            <div className={`apple-checkbox ${card.isCompleted ? "checked" : ""}`} onClick={toggleComplete}>
                                {card.isCompleted && "✓"}
                            </div>
                            <span className="card-title-text">{card.title}</span>
                        </div>

                        {card.description && (
                            <p className="card-description-preview">{card.description}</p>
                        )}

                        <div className="card-footer-meta">
                            {card.deadline && (
                                <div className="card-apple-date">
                                    <span className="clock-icon">🕒</span> {card.deadline}
                                </div>
                            )}

                            {card.responsibleUser && (
                                <div className="card-responsible-static">
                                    <img
                                        src={card.responsibleUser?.avatar || "/default-avatar.png"}
                                        alt={card.responsibleUser?.username}
                                        className="card-responsible-avatar"
                                    />
                                </div>
                            )}
                        </div>

                        {isMenuOpen && ReactDOM.createPortal(
                            <div
                                className="card-edit-popover"
                                style={{ top: `${popoverCoords.top}px`, left: `${popoverCoords.left}px` }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="popover-header">
                                    <h4>Настройки задачи</h4>
                                    <button className="popover-close-x" onClick={() => { setIsMenuOpen(false); setIsUserListOpen(false); }}>×</button>
                                </div>

                                <div className="popover-section">
                                    <span className="popover-label">Выбрать цвет</span>
                                    <div className="mini-color-picker-grid">
                                        {["#ff4d4f", "#52c41a", "#1890ff", "#faad14", "#eb2f96", "#13c2c2"].map(hex => (
                                            <div
                                                key={hex}
                                                className={`mini-color-dot ${card.color === hex ? "selected" : ""}`}
                                                style={{ backgroundColor: hex }}
                                                onClick={() => updateCardFields({ color: hex })}
                                            />
                                        ))}
                                    </div>
                                    {card.color && (
                                        <button className="reset-color-link" onClick={() => updateCardFields({ color: null })}>
                                            Сбросить цвет
                                        </button>
                                    )}
                                </div>

                                <div className="popover-section">
                                    <span className="popover-label">Ответственный</span>
                                    <div className="popover-responsible-ui">
                                        <div className="popover-user-info">
                                            <img
                                                src={card.responsibleUser?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=skyw4y"}
                                                alt="avatar"
                                                className="popover-responsible-avatar"
                                            />
                                            <span className="popover-username">
                                                {card.responsibleUser ? `@${card.responsibleUser.username}` : "Не назначен"}
                                            </span>
                                        </div>

                                        <button
                                            className={`popover-sub-edit-btn ${isUserListOpen ? "active" : ""}`}
                                            onClick={() => setIsUserListOpen(!isUserListOpen)}
                                            title="Изменить ответственного"
                                        >
                                            ✏️
                                        </button>
                                    </div>

                                    {isUserListOpen && (
                                        <div className="popover-users-dropdown">
                                            <div
                                                className="dropdown-user-item unassign-item"
                                                onClick={() => {
                                                    updateCardFields({ responsibleUser: null });
                                                    setIsUserListOpen(false);
                                                }}
                                            >
                                                ❌ Снять ответственного
                                            </div>

                                            {projectMembers && projectMembers.length > 0 ? (
                                                projectMembers.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className={`dropdown-user-item ${card.responsibleUser?.id === user.id ? "selected" : ""}`}
                                                        onClick={() => {
                                                            updateCardFields({ responsibleUser: user });
                                                            setIsUserListOpen(false);
                                                        }}
                                                    >
                                                        <img src={user.avatar || "/default-avatar.png"} alt="avatar" />
                                                        <div className="user-item-info">
                                                            <span className="user-item-name">{user.first_name} {user.last_name}</span>
                                                            <span className="user-item-username">@{user.username}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dropdown-no-users">Нет участников в проекте</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                );

                if (snapshot.isDragging) {
                    return ReactDOM.createPortal(cardElement, document.body);
                }
                return cardElement;
            }}
        </Draggable>
    );
}