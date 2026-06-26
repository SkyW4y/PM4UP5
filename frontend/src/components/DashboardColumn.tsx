import type { ReactNode } from 'react';
import "../styles/dashboard-column.css";

interface ColumnProps {
    title: string;
    onAddClick?: () => void;
    children?: ReactNode;
}

export default function DashboardColumn({ title, onAddClick , children }: ColumnProps) {
    return (
        <div className="dash-column-wrapper">
            <div className="dash-column-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span>{title}</span>
                {onAddClick && (
                    <button className="add-task-btn" onClick={onAddClick} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
                        +
                    </button>
                )}
            </div>
            <div className="dash-column-content">
                {children}
            </div>
        </div>
    );
}