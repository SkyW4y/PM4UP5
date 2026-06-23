import DetailModal from "./DetailModal";
import { type DetailedDeadline} from "../hooks/useDeadlineModal.ts";

import "../styles/dashboard-deadline-modal.css"
export type DashboardDeadlineModal = {
    isLoading: boolean;
    data: DetailedDeadline | null;
    onClose: () => void;
    onClick?: () => void;
    onChecked?: () => void;
}

export default function DashboardDeadlineModal(props: DashboardDeadlineModal) {
    if (props.isLoading || !props.data) {
        return (
            <DetailModal title="Загрузка данных..." onClose={props.onClose}>
                <div className="modal-skeleton">
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-spinner"></div>
                </div>
            </DetailModal>
        );
    }
    return (
        <DetailModal
            headerElement={
                <div className="deadline-modal-header">
                    <span>{props.data.task_type}</span>
                    <label htmlFor={`completedTask${props.data.id}`} className="checkbox-label">
                        <span>Выполнено:</span>
                        <input
                            id={`completedTask${props.data.id}`}
                            type="checkbox"
                            checked={props.data.is_completed}
                            onChange={props.onChecked}
                        />
                    </label>
                </div>
            }
            title={props.data.shortDescription}
            onClose={props.onClose}
        >
            <div className="deadline-modal-body">
                <span>Задача:</span>
                <div className="deadline-modal-task">
                    <p>{props.data.task}</p>  { /* TODO: На далекое будущее - добавить по хорошему поддержку MD */ }
                </div>
                <div className="deadline-modal-body-footer">
                    <span>Сдать: {props.data.deadline}</span>
                    <span>Осталось: {props.data.daysLeft}д</span>
                </div>

            </div>
        </DetailModal>
    );
}