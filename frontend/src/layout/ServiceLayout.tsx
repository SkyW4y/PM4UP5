import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../assets/favicon.svg';
import '../styles/service-layout.css';

export type LayoutContextType = {
    setTitle: (title: string) => void;
};

export default function ServiceLayout() {
    const [title, setTitle] = useState<string>('Название страницы');

    return (
        <div className="service-layout-root">
            <div className="bg-glow-container">
                <div className="glow-circle circle-cyan"></div>
                <div className="glow-circle circle-purple"></div>
                <div className="glow-circle circle-magenta"></div>
                <div className="glow-circle circle-blue"></div>
                <div className="glow-circle circle-indigo"></div>
                <div className="glow-circle circle-amber"></div>
            </div>

            <header className="top-header">
                <div className="header-logo-wrapper">
                    <img src={Logo} alt="Logo" className="header-logo" />
                </div>
                <h1 className="header-title">{title}</h1>
                <div className="header-spacer"></div>
            </header>

            <main className="service-main-content">
                <Outlet context={{ setTitle } satisfies LayoutContextType} />
            </main>
        </div>
    );
}