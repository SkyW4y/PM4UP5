export interface ColumnProps {
    id: number;
    name: string;
    cardIds: number[];
    cardsData: Record<number, any>;
    projectGroup: any[];
    onDragEnd: () => void;
}

export default function Column(props: ColumnProps) {

    return (
        <div className="column-container">
            <div className="column-header">
                <div className="column-title-zone">
                    <span className="column-title">{props.id}</span>
                    <span className="column-counter">{3}</span>
                </div>
                <div className="column-menu-btn">•••</div>
            </div>
            <div className="column-task-list">

            </div>
            <div className="column-footer">
                <button className="add-task-btn">
                    <span className="add-task-icon">+</span>
                    <span className="add-task-text">Добавить карточку</span>
                </button>
            </div>
        </div>
    );
}