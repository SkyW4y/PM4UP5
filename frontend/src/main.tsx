import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.tsx';
import { AuthProvider } from './api/AuthContext.tsx'

import './index.css';
// import NavBar from './navBar.tsx'
// import Deadline from './deadline.tsx'
//import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
        <RouterProvider router={router}/>
    </AuthProvider>

  </StrictMode>,
);
