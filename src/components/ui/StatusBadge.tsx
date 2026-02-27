import type { Status } from '../../data/mockData';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';

interface StatusBadgeProps {
    status: Status;
    showIcon?: boolean;
    color?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true, color }) => {
    const getIcon = () => {
        switch (status) {
            case 'finished': return <CheckCircle2 size={14} />;
            case 'ongoing': return <PlayCircle size={14} />;
            case 'not_started': return <Circle size={14} />;
        }
    };

    const getLabel = () => {
        switch (status) {
            case 'finished': return 'সম্পন্ন';
            case 'ongoing': return 'চলমান';
            case 'not_started': return 'শুরু হয়নি';
        }
    };

    const getStyle = (): React.CSSProperties | undefined => {
        if (!color) return undefined;
        if (status === 'finished') {
            return { backgroundColor: `${color}15`, color: color, borderColor: `${color}30`, border: '1px solid' };
        }
        if (status === 'ongoing') {
            return { backgroundColor: `${color}10`, color: color, borderColor: `${color}40`, border: '1px solid', boxShadow: `0 0 10px ${color}20` };
        }
        return undefined; // default not_started colors from css
    };

    return (
        <span
            className={`status-badge status-${status}`}
            style={getStyle()}
        >
            {showIcon && getIcon()}
            {getLabel()}
        </span>
    );
};
