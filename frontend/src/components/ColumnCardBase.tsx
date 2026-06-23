import type {ReactNode} from 'react';
import "../styles/ColumnCard.css";

export interface ColumnCardProps {
    subject: string;
    shortDescription: string;
    deadline: string;
    daysLeft: number;
    workType?: string;
    onClick?: () => void;
    children?: ReactNode;
    bottomContent?: ReactNode;
    cardIcon: ReactNode;
}

export default function ColumnCardBase(
    {
        subject,
        shortDescription,
        deadline,
        daysLeft,
        workType,
        onClick,
        children,
        bottomContent,
        cardIcon
    }: ColumnCardProps)
{
    return (
        <div className="card-wrapper ios-glass-bordered" onClick={onClick}>
            <div className="card-header">
                <div className="card-icon">{cardIcon}</div>
                <div className="card-subject">
                    <span>{subject}</span>
                    <div className="card-text">
                        <span>{workType}</span>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <div className="card-text-flow">
                     <span className={"card-description-text"}>{shortDescription}</span>
                    {children}
                </div>
            </div>
            {bottomContent && (
                <div className="bottom-content">
                    {bottomContent}
                </div>
            )}
            <div className="card-footer">
                <span className="card-deadline">Сдать: {deadline}</span>
                <span className="card-deadline"> Осталось: {daysLeft}д</span>
            </div>
        </div>
    );
}