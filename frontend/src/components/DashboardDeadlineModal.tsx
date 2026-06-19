import DetailModal from "./DetailModal";


export type DashboardDeadlineModal = {
    id: string;
    subject: string;
    shortDescription: string;
    task: string;
    deadline: string;
    daysLeft: number;
    workType?: string;
    isCompleted: boolean;
    onClick?: () => void;
    onChecked?: () => void;
}

export default function DashboardDeadlineModal(props: DashboardDeadlineModal) {
    return (
        <DetailModal
            headerElement={
                <div>
                    <span>Тут тип(ДЗ, Классная и т.п)</span>
                    <span>Выполнено:</span>
                    <input id={`completedTask${props.id}`} type="checkbox" defaultChecked={props.isCompleted} onClick={props.onChecked}/>
                </div>
            }
            title={props.shortDescription}
        >
            <div>
                <p>{props.task}</p> // TODO: На далекое будущее - добавить по хорошему поддержку MD
                <div>
                    <span>Сдать: {props.deadline}</span>
                    <span>Осталось: {props.daysLeft}д</span>
                </div>

            </div>
        </DetailModal>
    );
}