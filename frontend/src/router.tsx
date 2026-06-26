import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layout/MainLayout.tsx';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage.tsx';
import SubjectPage from './pages/SubjectPage.tsx';
import ServiceLayout from "./layout/ServiceLayout.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import InviteRequiredPage from "./pages/InviteRequiredPage.tsx";
import SubjectDetailPage from "./pages/SubjectDetailPage.tsx";
import CanbanPage from "./pages/CanbanPage.tsx";



export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <DashboardPage />
            },
            {
                path: "projects",
                element: <ProjectsPage />
            },
            {
                path: "project/:id",
                element: <CanbanPage />
            },
             {
                path: "subject",
                element: <SubjectPage />
            },
            {
                path: "subject/:id",
                element: <SubjectDetailPage />
            }
        ]
    },
    {
        path: '/',
        element: <ServiceLayout />,
        children: [
            {
                path: "auth",
                element: <AuthPage />
            },
            {
                path: "invite-required",
                element: <InviteRequiredPage />
            }
        ]
    }
]);