import { useTrackerStore } from '../store';

function getBestStreak(days: Record<string, any>) {
  let best = 0, current = 0, found = false;
  const sorted = Object.keys(days).sort();
  for (let i = 0; i < sorted.length; i++) {
    const doneCount = days[sorted[i]].blocks.filter((b: any) => b.status === 'done').length;
    let threshold = 10;
    if (i >= 31 && i < 61) threshold = 12;
    if (i >= 61) threshold = 14;
    if (doneCount >= threshold) {
      current++;
      found = true;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return found ? best : 0;
}

function getDaysLogged(days: Record<string, any>) {
  return Object.values(days).filter((d: any) =>
    d.blocks.some((b: any) => b.status === 'done' || b.status === 'skipped') ||
    (d.journal && d.journal.trim() !== '')
  ).length;
}

export default function StatsAchievements() {
  const { days, eliteScore } = useTrackerStore();
  const bestStreak = getBestStreak(days);
  const daysLogged = getDaysLogged(days);
  // Achievements
  const achievements = [
    bestStreak >= 7 && { icon: '🏅', label: '7-day Streak' },
    eliteScore >= 100 && { icon: '💯', label: '100 XP' },
    daysLogged >= 30 && { icon: '📅', label: '30 Days Logged' },
  ].filter(Boolean);

  return (
    <section style={{
      width: '100%',
      maxWidth: 320,
      background: 'none',
      borderRadius: 0,
      boxShadow: 'none',
      padding: '0.2rem 0 0.4rem 0',
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontSize: 15,
      alignItems: 'flex-start',
      borderBottom: '1px solid #e5e7eb',
    }}>
      <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 16, marginBottom: 0 }}>Stats & Achievements</div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 0 }}>
        <span title="Best Streak" style={{ color: '#fbbf24', fontWeight: 700 }}>🔥 {bestStreak}</span>
        <span title="Total XP" style={{ color: '#2563eb', fontWeight: 700 }}>XP: {eliteScore}</span>
        <span title="Days Logged" style={{ color: '#06b6d4', fontWeight: 700 }}>📆 {daysLogged}</span>
      </div>
      {achievements.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 0 }}>
          {achievements.map((a: any, i: number) => (
            <span key={i} style={{ background: '#e0e7ef', color: '#2563eb', borderRadius: 10, padding: '1px 8px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16 }}>{a.icon}</span> {a.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
} 