import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderSlot, ButtonsSlot, RightControlSlot } from "../components/LayoutSlots.tsx";
import NavButton from "../components/NavButton.tsx";
import DetailModal from "../components/DetailModal.tsx";
import { subjectsApi } from "../api/api.ts";
import "../styles/projects-page.css";
import "../styles/subjectPage.css";

interface SubjectItem {
    id: number;
    name: string;
    group_id: number;
}

export default function SubjectPage() {
    const navigate = useNavigate();

    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newSubjectName, setNewSubjectName] = useState<string>("");

    const loadSubjects = async () => {
        try {
            setIsLoading(true);
            const data = await subjectsApi.getSubjects();
            setSubjects(data);
        } catch (error) {
            console.error("Ошибка при загрузке предметов:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSubjects();
    }, []);

    const handleCreateSubject = async (e: FormEvent) => {
        e.preventDefault();
        if (!newSubjectName.trim()) return;

        try {
            await subjectsApi.createSubject({ name: newSubjectName.trim() });
            setNewSubjectName("");
            setIsModalOpen(false);
            await loadSubjects();
        } catch (error) {
            console.error("Ошибка при создании предмета:", error);
        }
    };

    return (
        <>
            <HeaderSlot>
                {"Предметы"}
            </HeaderSlot>
            <RightControlSlot>
                <span></span>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(255,255,255,0.15)",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "14px",
                        backdropFilter: "blur(10px)"
                    }}
                >
                    ＋ Новый предмет
                </button>
            </RightControlSlot>
            <ButtonsSlot>
                <NavButton isActive={false} link={"/"} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                         className="bi bi-view-stacked" viewBox="0 0 16 16">
                        <path
                            d="M3 0h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm0 8h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                    </svg>
                }/>
                <NavButton isActive={false} link={"/projects"} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                         className="bi bi-kanban-fill" viewBox="0 0 16 16">
                        <path
                            d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1-0 0 1-1-1V3a1 1 0 0 1 1-1"/>
                    </svg>
                }/>
                <NavButton isActive={true} link={"/subject"} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-journal-bookmark-fill" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M6 1h6v7a.5.5 0 0 1-.757.429L9 7.083 6.757 8.43A.5.5 0 0 1 6 8z"/>
                      <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
                      <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/>
                    </svg>
                }/>
            </ButtonsSlot>

            <div className="subjectWrapper">
                {isLoading ? (
                    <p style={{ color: "rgba(255,255,255,0.6)", gridColumn: "span 3" }}>Загрузка предметов...</p>
                ) : subjects.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.6)", gridColumn: "span 3" }}>Предметы еще не созданы.</p>
                ) : (
                    subjects.map(subject => {
                        return (
                            <div
                                key={subject.id}
                                className="subjectCardWrapper"
                                onClick={() => navigate(`/subject/${subject.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                <p className="subjectTitle">{subject.name}</p>
                                <div className="subjectLogoCard">
                                    <div style={{ fontSize: "3rem", textAlign: "center", paddingTop: "1.5vh" }}>📘</div>
                                </div>
                                <p className="subjectTask" style={{ paddingRight: "10px" }}>ID: {subject.id}</p>
                            </div>
                        );
                    })
                )}
            </div>

            {isModalOpen && (
                <DetailModal title="Создание предмета" onClose={() => setIsModalOpen(false)}>
                    <form onSubmit={handleCreateSubject} style={{ display: "flex", flexDirection: "column", gap: "15px", padding: "10px 0" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <label style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Название предмета</label>
                            <input
                                type="text"
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                placeholder="Например, Высшая математика"
                                required
                                autoFocus
                                style={{
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    background: "rgba(0,0,0,0.2)",
                                    color: "#fff",
                                    outline: "none"
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                padding: "10px",
                                borderRadius: "6px",
                                border: "none",
                                background: "#007aff",
                                color: "#fff",
                                fontWeight: "600",
                                cursor: "pointer",
                                marginTop: "5px"
                            }}
                        >
                            Создать
                        </button>
                    </form>
                </DetailModal>
            )}
        </>
    );
}