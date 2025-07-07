import ProgressDonut from './ProgressDonut';
import TaskTable from './TaskTable';
import StreakStars from './StreakStars';
import DailyJournal from './DailyJournal';
import StatsAchievements from './StatsAchievements';

export default function DashboardMain() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 420px) 1fr',
      gap: 0,
      width: '100vw',
      height: 'calc(100vh - 80px)',
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
        justifyContent: 'center',
        gap: '1.2rem',
        height: '100%',
        background: 'none',
        margin: 0,
        padding: 0,
        borderRadius: 0,
      }}>
        <ProgressDonut />
        <div style={{ marginTop: 12 }}><StreakStars /></div>
        <StatsAchievements />
        <div style={{ width: '100%', maxWidth: 320 }}>
          <DailyJournal compact />
        </div>
      </div>
      <div style={{
        height: '100%',
        overflow: 'auto',
        background: 'none',
        margin: 0,
        padding: 0,
        borderRadius: 0,
      }}>
        <TaskTable />
      </div>
    </div>
  );
} 