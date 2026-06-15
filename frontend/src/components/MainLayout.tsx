import '../styles/layout.css';

interface LayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: LayoutProps) {
    return (
        <div className="layout-container">
            <header className="header">
                <div className="page-name">
                    <span>Dashboard</span>
                    <div className="page-name-underline"></div>
                </div>
                <div className="profile_btn">
                    <img src="../assets/hero.png" alt="avatar"/>
                </div>
            </header>
            <aside className="Aside">
                <div className="logo">
                    <img src="../assets/hero.png" alt="avatar"/>
                </div>
                {/* тут хочу сделать кнопки навигации отдельным компонентом*/}
                <button>Daaa</button>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}