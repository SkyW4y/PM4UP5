import { HeaderSlot, ButtonsSlot } from "../components/LayoutSlots.tsx";
import NavButton from "../components/NavButton.tsx";
import "../styles/projects-page.css"
import "../styles/subjectPage.css"


export default function SubjectPage() {
    const subjectArr = []
    for(let i=0;i<=10;i++){
        subjectArr.push({
            id: i,
            title: "zalupa" + i,
            logo: "/$"
        })
    }
    return (
        <>
            <HeaderSlot>
                {"Предметы"}
            </HeaderSlot>
            <ButtonsSlot>
                <NavButton isActive={false} link={"/"} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                         className="bi bi-view-stacked" viewBox="0 0 16 16">
                        <path
                            d="M3 0h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm0 8h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                    </svg>
                }/>
                <NavButton isActive={true} link={"/projects"} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                         className="bi bi-kanban-fill" viewBox="0 0 16 16">
                        <path
                            d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1"/>
                    </svg>
                }/>
                                <NavButton isActive={false} link={"/subject"} icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                                         className="bi bi-kanban-fill" viewBox="0 0 16 16">
                                        <path
                                            d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1"/>
                                    </svg>
                                }/>
            </ButtonsSlot>

                <div className="subjectWrapper">
                    {subjectArr.map(subject=>{
                        return <div className="subjectCardWrapper">
                            <p className="subjectTitle">{subject.title}</p>
                            <div className="subjectLogoCard">
                            <img  src={subject.logo} alt="logo" />
                            </div>
                            <p className="subjectTask">Задачи: {subject.id}</p>
                            </div>
                    })}
                </div>

        </>
    );
}