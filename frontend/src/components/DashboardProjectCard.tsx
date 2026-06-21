import ColumnCardBase from "./ColumnCardBase.tsx";
import RGBProgressBar from "./RGBProgressBar.tsx";

import "../styles/dashboard-project-card.css";

export interface DashboardProjectCardProps {
        subject: string;
        shortName: string;
        deadline: string;
        daysLeft: number;
        onClick?: () => void;
        cardIcon?: string;
        users: string[]; // Url на аватарку
        progress: number; // проценты в INT

}

export default function DashboardProjectCard(
    {
        subject,
        shortName,
        deadline,
        daysLeft,
        onClick,
        cardIcon,
        users,
        progress,
    }: DashboardProjectCardProps
) {
    return (
        <>
            <ColumnCardBase
                subject={subject}
                deadline={deadline}
                daysLeft={daysLeft}
                cardIcon={cardIcon}
                shortDescription={shortName}
                onClick={onClick}
                bottomContent={
                    <div className="progress-bar-area">
                        <RGBProgressBar progress={progress} />
                    </div>
                }
            >

                    <div className="project-group">
                        {
                            users.map((e : string) => {
                                return (
                                    <div key={e} className="project-user">
                                        <img src={e} alt="user" />
                                    </div>
                                );
                            })
                        }
                    </div>
            </ColumnCardBase>
        </>
    );
}