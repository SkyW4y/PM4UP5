// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import NavBar from './navBar.tsx'
// import Deadline from './deadline.tsx'
// import MainLayout from "./components/MainLayout.tsx";
//
// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <NavBar />
//     <Deadline />
//   </StrictMode>,
// )
import MainLayout from "./components/MainLayout.tsx";

export default function App() {
    return (
        <MainLayout></MainLayout>
    );
}