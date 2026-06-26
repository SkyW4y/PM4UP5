import "../styles/mini-calendar.css";
import type {UiDeadline, UiProjectShort} from "../api/mappers.ts";

interface MiniCalendarProps {
    deadlines: UiDeadline[];
    projects: UiProjectShort[];
    onDayClick?: (id: number) => void;
}

export default function MiniCalendar({ deadlines, projects, onDayClick }: MiniCalendarProps) {
    const totalCells = 24;
    const gridCells = [];

    let checkDate = new Date();

    while (gridCells.length < totalCells) {
        if (checkDate.getDay() === 0) {
            checkDate.setDate(checkDate.getDate() + 1);
            continue;
        }

        gridCells.push(new Date(checkDate));
        checkDate.setDate(checkDate.getDate() + 1);
    }

    const getDayData = (date: Date, index: number) => {
        if (index === 0) {
            return {
                status: "active",
                count: 0,
                firstTaskId: null
            };
        }

        const dayStr = String(date.getDate()).padStart(2, "0");
        const monthStr = String(date.getMonth() + 1).padStart(2, "0");
        const yearStr = date.getFullYear();
        const ruDateString = `${dayStr}.${monthStr}.${yearStr}`;

        const dayDeadlines = deadlines.filter(item => item.deadlineStr === ruDateString);
        const dayProjects = projects.filter(item => item.deadlineStr === ruDateString);
        const totalTasks = dayDeadlines.length + dayProjects.length;

        if (totalTasks === 0) {
            return { status: "default", count: 0, firstTaskId: null };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate.getTime() - today.getTime();
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        let status = "yellow";
        if (daysLeft <= 1) {
            status = "red";
        } else if (daysLeft <= 3) {
            status = "orange";
        }

        return {
            status,
            count: totalTasks,
            firstTaskId: dayDeadlines[0]?.id /*|| dayProjects[0]?.id */|| null // TODO: когда будут готовы проекты заменить на норм
        };
    };

    return (
        <div className="calendar-container">
            <div className="calendar-card">
                <div className="calendar-header">
                    <div className="calendar-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <h3 className="calendar-month-title">Таймлайн задач</h3>
                </div>

                <div className="calendar-grid">
                    {gridCells.map((date, index) => {
                        const dayNumber = date.getDate();
                        const { status, count, firstTaskId } = getDayData(date, index);

                        return (
                            <div
                                key={date.toISOString()}
                                className={`calendar-day-cell cell-${status}`}
                                onClick={() => {
                                    if (firstTaskId && onDayClick) onDayClick(firstTaskId);
                                }}
                            >
                                {dayNumber}
                                {count > 0 && <span className="cell-badge">{count}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}