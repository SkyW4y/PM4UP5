import { Outlet, useNavigate } from 'react-router-dom';
import {type ReactNode, useState} from 'react';
import ProfileBtn from "../components/ProfileBtn.tsx";
import { useAuth } from '../api/AuthContext.tsx'
import Logo from '../assets/favicon.svg';
import '../styles/layout.css';


export type LayoutContextType = {
    setTitle: (title: string) => void;
    setButtons?: (buttons: ReactNode[]) => void;
    setRightControl?: (rightControl: ReactNode[]) => void;
};

export default function MainLayout() {
    const [title, setTitle] = useState<string>('');
    const [buttons, setButtons] = useState<ReactNode[]>([]);
    const [rightControl, setRightControl] = useState<ReactNode[]>([]);
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, loading } = useAuth();

    if (loading) return <div>Проверка авторизации...</div>;
    if (!isAuthenticated) {
        navigate('/auth');
    }
    return (
        <div className="layout-container">
            <aside className="sidebar ios-glass">
                <div className="logo">
                    <img src={Logo as string} alt="avatar"/>
                </div>
                {/* тут хочу сделать кнопки навигации отдельным компонентом*/}
                {buttons.map((button) => (button))}
            </aside>
            <header className="header">
                <div className="header-left">
                    <div className="page-controls-left">
                        ///
                    </div>
                </div>

                <div className="page-name">
                    <span>{title}</span>
                    <div className="page-name-underline"></div>
                </div>
                <div className="header-right">
                    <div className="page-controls-righ">
                        {rightControl}
                    </div>
                    <ProfileBtn username={user?.username} avatarUrl={user?.avatar} onLogout={logout} />
                </div>

            </header>
            <main className="main-content">
                <Outlet context={{setTitle, setButtons, setRightControl} satisfies LayoutContextType}/>
            </main>
        </div>
    );
}