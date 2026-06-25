// src/pages/InviteRequiredPage.tsx
import { useEffect, useState } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { type LayoutContextType } from '../layout/ServiceLayout';
import { AuthCard } from '../components/auth/AuthCard';
import DetailModal from '../components/DetailModal';
import {groupsApi} from "../api/api.ts";

export default function InviteRequiredPage() {
    const { setTitle } = useOutletContext<LayoutContextType>();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        setTitle('Доступ ограничен');
    }, [setTitle]);

    const handleCreateGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError('');

        if (!groupName.trim()) {
            setModalError('Имя группы не может быть пустым');
            return;
        }

        try {

            // @ts-ignore
            const response = await groupsApi.createGroup({name: groupName});

            console.log('Отправка на бэк запроса создания группы:', groupName);

            setIsModalOpen(false);
            navigate('/');
        } catch (error: any) {
            setModalError(error.message || 'Не удалось создать группу. Попробуйте другое имя.');
        }
    };

    return (
        <div className="auth-page-container">
            <AuthCard title="Вход по приглашению">
                <div className="invite-info-content">
                    <p>
                        Доступ к функционалу сайта <strong>«Tralalela»</strong> без группы невозможен.
                    </p>
                    <p>
                        Создайте или вступите в группу по ссылке приглашения.
                    </p>

                    <div className="invite-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                        <button
                            type="button"
                            className="auth-submit-btn"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Создать группу
                        </button>

                        <Link to="/auth" className="auth-submit-btn text-center-link" style={{ background: 'transparent', textAlign: 'center' }}>
                            Вернуться к авторизации
                        </Link>
                    </div>
                </div>
            </AuthCard>
            {isModalOpen && (
                <div className="modal-backdrop-blur">
                    <DetailModal
                        title="Создание группы"
                        onClose={() => {
                            setIsModalOpen(false);
                            setGroupName('');
                            setModalError('');
                        }}
                    >
                        <form onSubmit={handleCreateGroupSubmit} className="auth-form" style={{ padding: '10px 0 0 0' }}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Имя группы (например: ИВТ-41)"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className={modalError ? 'input-error' : ''}
                                    autoFocus
                                />
                            </div>

                            {modalError && <p className="auth-error-text" style={{ marginLeft: '4px' }}>{modalError}</p>}

                            <button type="submit" className="auth-submit-btn" style={{ marginTop: '10px' }}>
                                Подтвердить создание
                            </button>
                        </form>
                    </DetailModal>
                </div>
            )}
        </div>
    );
}