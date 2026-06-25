import React from 'react';
import '../../styles/auth-card.css';

interface AuthCardProps {
    title: string;
    hasError?: boolean;
    children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, hasError = false, children }) => {
    return (
        <div className={`auth-card ${hasError ? 'card-error-glow' : ''}`}>
            <div className="auth-card-header">
                <h2>{title}</h2>
            </div>
            <div className="auth-card-body">
                {children}
            </div>
        </div>
    );
};