import { useNavigate } from "react-router-dom";
import '../styles/prifile-btn.css'

export interface ProfileBtnProps {
    username: string | undefined;
    avatarUrl: string | null | undefined;
    onLogout?: () => void;
}

export default function ProfileBtn({ username, avatarUrl, onLogout }: ProfileBtnProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");

        if (onLogout) {
            onLogout();
        } else {
            navigate("/login");
        }
    };

    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' fill='rgba(255,255,255,0.4)' class='bi bi-person-circle' viewBox='0 0 16 16'><path d='M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'/><path fill-rule='evenodd' d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z'/></svg>";

    return (
        <>
            <div className="profile_btn_wrapper">
                <span className="profile_username">{username}</span>

                <div className="profile_btn">
                    <img
                        src={avatarUrl || defaultAvatar}
                        alt={`${username}'s avatar`}
                        onError={(e) => {
                            e.currentTarget.src = defaultAvatar;
                        }}
                    />

                    <div className="profile_dropdown_menu">
                        <button className="logout_btn" onClick={handleLogout}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                            </svg>
                            Выйти
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}