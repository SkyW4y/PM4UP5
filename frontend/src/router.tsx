import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layout/MainLayout.tsx';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage.tsx';
import SubjectPage from './pages/SubjectPage.tsx';
import ServiceLayout from "./layout/ServiceLayout.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import InviteRequiredPage from "./pages/InviteRequiredPage.tsx";



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
                path: "subject",
                element: <SubjectPage />
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