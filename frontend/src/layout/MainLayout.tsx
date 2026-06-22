import { Outlet } from 'react-router-dom';
import {type ReactNode, useState} from 'react';
//import type { ReactNode } from 'react';

import Logo from '../assets/favicon.svg';
import '../styles/layout.css';


export type LayoutContextType = {
    setTitle: (title: string) => void;
    setButtons?: (buttons: ReactNode[]) => void;
    setRightControl?: (control: ReactNode) => void;
};

export default function MainLayout() {
    const [title, setTitle] = useState<string>('');
    const [buttons, setButtons] = useState<ReactNode[]>([]);

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
                        ///
                    </div>
                    <div className="profile_btn">
                        <img src={"https://api.dicebear.com/7.x/bottts/svg?seed=skyw4y"} alt="avatar"/>
                    </div>
                </div>

            </header>
            <main className="main-content">
                <Outlet context={{setTitle, setButtons} satisfies LayoutContextType}/>
            </main>
        </div>
    );
}