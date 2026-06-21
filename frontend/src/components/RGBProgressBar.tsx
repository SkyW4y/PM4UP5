import "../styles/rgb-progress-bar.css";

interface RGBProgressBarProps {
    progress: number;
}

export default function RGBProgressBar({ progress }: RGBProgressBarProps) {
    const cleanProgress = Math.max(0, Math.min(100, progress));

    return (
        <div className="progress-container">
            <div
                className="progress-bar-rgb"
                style={{ width: `${cleanProgress}%` }}
            />
        </div>
    );
}