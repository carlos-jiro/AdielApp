import { useAppStore } from '@/store/useAppStore'; 
import { useEffect } from 'react';

export const useDashboardStats = () => {
    const fetchStats = useAppStore(state => state.fetchAttendanceStats);
    const stats = useAppStore(state => state.attendanceStats);
    const userInfo = useAppStore(state => state.userInfo);

    useEffect(() => {
        if (userInfo) {
        fetchStats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo]);

    return {
        stats,
    };
};