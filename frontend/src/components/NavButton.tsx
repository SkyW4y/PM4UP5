import type {ReactNode} from "react";

import "../styles/nav-button.css";
import {Link} from "react-router-dom";

interface NavButtonProps {
    isActive: boolean;
    icon?: ReactNode;
    text?: string;
    link: string;
}

export default function RGBProgressBar({ isActive, icon, text, link }: NavButtonProps) {
    return (
        <Link to={link}>
            <button className={ isActive ? "layout-active-btn" : "layout-btn"} >{icon}{text}</button>
        </Link>

    );
}