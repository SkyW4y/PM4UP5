import { type ReactNode } from "react";
import "../styles/detail-modal.css";

export interface DetailModalProps {
    headerElement?: ReactNode;
    children?: ReactNode;
    title: string;
    onClose?: () => void;

}

export default function DetailModal(props: DetailModalProps) {
    return (
        <div className="modal-container">
            <div className="modal-header">
                <span className={"modal-title"}>{props.title}</span>
                {props.headerElement}
                <button className="modal-close-btn" onClick={props.onClose}>+</button>
            </div>
            <div className="modal-body">
                {props.children}
            </div>
        </div>
    );
}