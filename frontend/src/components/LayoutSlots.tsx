/*
Этот слот нужен для связи с MainLayout из вне (снизу вверх)

 */
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { LayoutContextType } from './MainLayout.tsx';

interface HeaderTitleProps {
    children: string;
}

export default function HeaderSlot({ children }: HeaderTitleProps) {
    const { setTitle } = useOutletContext<LayoutContextType>();

    useEffect(() => {
        setTitle(children);
        return () => setTitle('');
    }, [children, setTitle]);

    return null;
}