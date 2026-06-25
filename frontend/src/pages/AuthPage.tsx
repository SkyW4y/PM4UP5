// src/pages/AuthPage.tsx
import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { type LayoutContextType } from '../layout/ServiceLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { authApi } from '../api/api.ts';
import { useAuth } from '../api/AuthContext';

export default function AuthPage() {
    const { setTitle } = useOutletContext<LayoutContextType>();
    const { handleAuthSuccess } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);

    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');

    const [isValidationError, setIsValidationError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setTitle(isLogin ? 'Авторизация' : 'Регистрация профиля');
        setIsValidationError(false);
        setErrorMessage('');
    }, [isLogin, setTitle]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsValidationError(false);
        setErrorMessage('');

        try {
            if (isLogin) {
                if (!usernameOrEmail || !password) {
                    setIsValidationError(true);
                    setErrorMessage('Заполните все поля');
                    return;
                }
                const response = await authApi.login({
                    username_or_email: usernameOrEmail,
                    password: password
                });
                handleAuthSuccess(response);

                // TODO: ПРОВЕРКА ГРУППЫ: Измени response.user?.group_id под реальную структуру твоего API
                if (!response.user?.group_id) {
                    navigate('/invite-required');
                } else {
                    navigate('/projects');
                }
            } else {
                if (!username || !email || !firstName || !lastName || !password) {
                    setIsValidationError(true);
                    setErrorMessage('Все поля обязательны для заполнения');
                    return;
                }
                const response = await authApi.register({
                    username,
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    password
                });
                handleAuthSuccess(response);

                navigate('/invite-required');
            }
        } catch (error: any) {
            setIsValidationError(true);
            setErrorMessage(error.message || 'Произошла ошибка. Проверьте введенные данные.');
        }
    };

    return (
        <div className="auth-page-container">
            <AuthCard title={isLogin ? 'Войти' : 'Регистрация'} hasError={isValidationError}>
                <form onSubmit={handleSubmit} className="auth-form">
                    {isLogin ? (
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Логин или Email"
                                value={usernameOrEmail}
                                onChange={(e) => setUsernameOrEmail(e.target.value)}
                                className={isValidationError && !usernameOrEmail ? 'input-error' : ''}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Уникальный логин (username)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={isValidationError && !username ? 'input-error' : ''}
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Email адрес"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={isValidationError && !email ? 'input-error' : ''}
                                />
                            </div>
                            <div className="input-group flex-row-inputs">
                                <input
                                    type="text"
                                    placeholder="Имя"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={isValidationError && !firstName ? 'input-error' : ''}
                                />
                                <input
                                    type="text"
                                    placeholder="Фамилия"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={isValidationError && !lastName ? 'input-error' : ''}
                                />
                            </div>
                        </>
                    )}

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={isValidationError && !password ? 'input-error' : ''}
                        />
                    </div>

                    {errorMessage && <p className="auth-error-text">{errorMessage}</p>}

                    <button type="submit" className="auth-submit-btn">
                        {isLogin ? 'Продолжить' : 'Создать аккаунт'}
                    </button>

                    <div className="auth-toggle-mode-container">
                        <button
                            type="button"
                            className="auth-toggle-btn"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                        </button>
                    </div>
                </form>
            </AuthCard>
        </div>
    );
}