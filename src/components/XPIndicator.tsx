import { useTrackerStore, getLevel } from '../store';

export default function XPIndicator() {
  const { eliteScore } = useTrackerStore();
  const level = getLevel(eliteScore);
  const prevLevelXP = level.level > 1 ? getLevel(eliteScore - 1).xpToNext + eliteScore - 1 : 0;
  const progress = (eliteScore - (eliteScore - level.xpToNext)) / (level.xpToNext === 0 ? 1 : level.xpToNext + eliteScore - (eliteScore - level.xpToNext));

  return (
    <div style={{
      width: 220,
      background: '#fff',
      borderRadius: 999,
      boxShadow: '0 2px 8px #e5e7eb',
      padding: '0.7rem 1.2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      margin: '0.5rem 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}>
        <span style={{ fontSize: 22 }}>{level.icon}</span>
        <span style={{ fontWeight: 700, color: '#2563eb', fontSize: 16 }}>{level.title}</span>
        <span style={{ fontWeight: 500, color: '#888', fontSize: 13 }}>XP: <b>{eliteScore}</b></span>
      </div>
      <div style={{ width: '100%', marginTop: 2 }}>
        <div style={{ height: 8, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden', width: '100%' }}>
          <div style={{ height: 8, background: 'linear-gradient(90deg,#2563eb,#06b6d4)', width: `${Math.min(100, Math.round((1 - level.xpToNext/(level.xpToNext+eliteScore-(eliteScore-level.xpToNext)))*100))}%`, transition: 'width 0.3s', borderRadius: 6 }} />
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2, textAlign: 'center' }}>
          {level.xpToNext > 0 ? `${level.xpToNext} XP to next level` : 'Max Level'}
        </div>
      </div>
    </div>
  );
} 