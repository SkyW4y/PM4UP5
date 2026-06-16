import { ReactNode } from 'react';
import "../styles/file.css";

interface ColumnCardProps {
    subject: string;
    shortDescription: string;
    deadline: string;
    daysLeft: number;
    wordType: string;
    onClick?: () => void;
    children: ReactNode;
}

export default function DashboardColumn({ title, onAddClick , children }: ColumnProps) {
    return (
        <div className="card-wrapper">
            <div className="card-header">

            </div>
            <div className="card-body">
                {children}
            </div>
            <div className="card-footer">

            </div>
        </div>
    );
}