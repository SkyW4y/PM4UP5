import { Outlet} from 'react-router-dom';
import { useState, ReactNode } from 'react';

import avatarImage from '../assets/hero.png';
import '../styles/layout.css';


export type LayoutContextType = {
    setTitle: (title: string) => void;
};

export default function MainLayout() {
    const [title, setTitle] = useState<string>('');


    return (
        <div className="layout-container">
            <aside className="sidebar ios-glass">
                <div className="logo">
                    <img src={avatarImage as string} alt="avatar"/>
                </div>
                {/* тут хочу сделать кнопки навигации отдельным компонентом*/}
                <button>Daaa</button>
            </aside>
            <header className="header">
                <div className="page-name">
                    <span>{title}</span>
                    <div className="page-name-underline"></div>
                </div>
                <div className="profile_btn">
                    <img src={avatarImage as string} alt="avatar"/>
                </div>
            </header>
            <main className="main-content">
                <Outlet context={{setTitle} satisfies LayoutContextType}/>
            </main>
        </div>
    );
}