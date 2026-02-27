
interface ProgressBarProps {
    progress: number;
    showLabel?: boolean;
    color?: string;
    height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, showLabel = true, color, height }) => {
    const safeProgress = Math.min(100, Math.max(0, progress));

    return (
        <div style={{ width: '100%' }}>
            {showLabel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>সামগ্রিক অগ্রগতি</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{safeProgress}%</span>
                </div>
            )}
            <div className="progress-bar-container" style={height ? { height: `${height}px` } : {}}>
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${safeProgress}%`,
                        ...(color ? { background: `linear-gradient(90deg, ${color}, ${color}bb)`, boxShadow: `0 0 12px ${color}60` } : {})
                    }}
                />
            </div>
        </div>
    );
};
