import DashboardColumn from "../components/DashboardColumn.tsx";
import HeaderSlot from "../components/LayoutSlots.tsx";


function onProjectAddClick() {
    alert("Add Project");
}

export default function DashboardPage() {
    return (
        <>
            <HeaderSlot>
                {"Dashboard"}
            </HeaderSlot>
            <DashboardColumn title={"Ближайшие дедлайны"} />
            <DashboardColumn title={"Групповые проекты"} onAddClick={onProjectAddClick}/>
        </>
    );
}