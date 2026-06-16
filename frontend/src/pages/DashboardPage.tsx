import DashboardColumn from "../components/DashboardColumn.tsx";
import HeaderSlot from "../components/LayoutSlots.tsx";
import ColumnCardBase from "../components/ColumnCardBase.tsx";

function onProjectAddClick() {
    alert("Add Project");
}

// --- MOCK ДАННЫЕ ДЛЯ КОЛОНКИ ДЕДЛАЙНОВ ---
const mockDeadlines = [
    {
        id: 1,
        subject: "Введение в ИТ",
        workType: "ДЗ",
        deadline: "18.06.2026",
        daysLeft: 2,
        cardIcon: "🐧",
        short_description: "Лабораторная работа №3"
    },
    {
        id: 2,
        subject: "П-практика",
        workType: "ДЗ",
        deadline: "18.06.2026",
        daysLeft: 12,
        cardIcon: "🐧",
        short_description: "Сделать эту хрень"
    },
];

// --- MOCK ДАННЫЕ ДЛЯ КОЛОНКИ ПРОЕКТОВ ---
const mockProjects = [
    {
        id: 101,
        subject: "Разработка Tralalela",
        workType: "",
        deadline: "28.06.2026",
        daysLeft: 12,
        cardIcon: "⚡",

        users: [
            {
                uid: 112341,
                username: "gondon",
                avaUrl: "url на ченить",
            },
            {
                uid: 132341,
                username: "gondonio",
                avaUrl: "url на ченить",
            },
        ]
    }
];

function onCardClick() {
    alert("Card");
}

export default function DashboardPage() {
    return (
        <>
            <HeaderSlot>
                {"Dashboard"}
            </HeaderSlot>
            <DashboardColumn title={"Ближайшие дедлайны"}>
                {mockDeadlines.map((item) => (
                    <ColumnCardBase
                        key={item.id}
                        subject={item.subject}
                        workType={item.workType}
                        deadline={item.deadline}
                        daysLeft={item.daysLeft}
                        cardIcon={item.cardIcon}
                        shortDescription={item.short_description}
                        onClick={() => {alert(`Card clicked ${item.id}`)}}
                    />
                ))}
            </DashboardColumn>
            <DashboardColumn title={"Групповые проекты"} onAddClick={onProjectAddClick}/>
        </>
    );
}