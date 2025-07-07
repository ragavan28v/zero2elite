import { useTrackerStore, getStreakAsOfYesterday } from '../store';
import { StarIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

export default function StreakStars() {
  const { days } = useTrackerStore();
  const streak = getStreakAsOfYesterday(days);
  const maxStars = 7;
  const [animatedStreak, setAnimatedStreak] = useState(streak);
  useEffect(() => {
    setAnimatedStreak(streak);
  }, [streak]);
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }} title={`Current streak: ${streak}`}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <StarIcon
          key={i}
          style={{
            width: 20,
            height: 20,
            color: i < animatedStreak ? '#fbbf24' : '#e5e7eb',
            stroke: '#fbbf24',
            strokeWidth: 1,
            opacity: i < animatedStreak ? 1 : 0.5,
            transform: i < animatedStreak ? 'scale(1.15)' : 'scale(1)',
            transition: 'color 0.4s, opacity 0.4s, transform 0.4s',
          }}
        />
      ))}
    </span>
  );
} 