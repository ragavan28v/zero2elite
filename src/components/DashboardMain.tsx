import ProgressDonut from './ProgressDonut';
import TaskTable from './TaskTable';
import StreakStars from './StreakStars';
import DailyJournal from './DailyJournal';
import StatsAchievements from './StatsAchievements';
import { useTrackerStore } from '../store';
import { useEffect, useState } from 'react';

export default function DashboardMain() {
  const { currentUser } = useTrackerStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure user is authenticated
  if (!currentUser) {
    return null; // AuthGuard will handle this
  }
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 420px) 1fr',
      gap: 0,
      width: isMobile ? '100%' : '100vw',
      height: isMobile ? 'auto' : 'calc(100vh - 80px)',
      minHeight: isMobile ? 'auto' : 0,
      background: 'none',
      padding: 0,
      margin: 0,
      boxSizing: 'border-box',
      borderRadius: 0,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '0.9rem' : '1.2rem',
        height: isMobile ? 'auto' : '100%',
        minHeight: 0,
        background: 'none',
        margin: 0,
        padding: isMobile ? '0.75rem 0.75rem 0.25rem' : 0,
        borderRadius: 0,
      }}>
        <ProgressDonut />
        <div style={{ marginTop: isMobile ? 8 : 12 }}><StreakStars /></div>
        <StatsAchievements />
        <div style={{ width: '100%', maxWidth: isMobile ? '100%' : 320 }}>
          <DailyJournal compact />
        </div>
      </div>
      <div style={{
        height: isMobile ? 'auto' : '100%',
        overflow: isMobile ? 'visible' : 'auto',
        background: 'none',
        margin: 0,
        padding: isMobile ? '0 0.75rem 1rem' : 0,
        borderRadius: 0,
      }}>
        <TaskTable />
      </div>
    </div>
  );
} 
