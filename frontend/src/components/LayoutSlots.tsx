/*
Этот слот нужен для связи с MainLayout из вне (снизу вверх)

 */
import {useEffect, type ReactNode, useRef} from 'react';
import { useOutletContext } from 'react-router-dom';
import type { LayoutContextType } from '../layout/MainLayout.tsx';


interface HeaderTitleProps {
    children: string;
}

interface NavBtnsProps {
    children: ReactNode[];
}

interface RightControlProps {
    children: ReactNode[];
}

export function ButtonsSlot({ children }: NavBtnsProps) {
    const { setButtons } = useOutletContext<LayoutContextType>();
    const childrenRef = useRef(children);

    useEffect(() => {
        childrenRef.current = children;
    }, [children]);

    useEffect(() => {
        setButtons?.(childrenRef.current);
        return () => setButtons?.([]);
    }, [setButtons]);

    return null;
}

export function RightControlSlot({ children }: RightControlProps) {
    const { setRightControl } = useOutletContext<LayoutContextType>();
    const childrenRef = useRef(children);

    useEffect(() => {
        childrenRef.current = children;
    }, [children]);

    useEffect(() => {
        setRightControl?.(childrenRef.current);
        return () => setRightControl?.([]);
    }, [setRightControl]);

    return null;
}

export function HeaderSlot({ children }: HeaderTitleProps) {
    const { setTitle } = useOutletContext<LayoutContextType>();

    useEffect(() => {
        setTitle(children);
        return () => setTitle('');
    }, [children, setTitle]);

    return null;
}