import { CalendarDaysIcon } from '@heroicons/react/24/solid';
import { useTrackerStore, getLevel } from '../store';
import { useState, useEffect } from 'react';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function CalendarDropdown({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) {
  // Simple calendar for current month
  const today = getTodayISO();
  const d = new Date(value);
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(startDay).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)]);

  return (
    <div style={{ position: 'absolute', top: 48, left: 0, zIndex: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 2px 12px #e5e7eb', padding: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, textAlign: 'center' }}>{d.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 2em)', gap: 2, marginBottom: 4 }}>
        {[...Array(7)].map((_, i) => <div key={i} style={{ fontWeight: 600, fontSize: 12, color: '#888', textAlign: 'center' }}>{'SMTWTFS'[i]}</div>)}
        {weeks.flat().map((day, i) => day ? (
          <button
            key={i}
            style={{
              width: '2em', height: '2em', borderRadius: 6, border: 'none', background: (day === d.getDate() ? '#2563eb' : today === `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` ? '#e0e7ef' : 'transparent'), color: day === d.getDate() ? '#fff' : '#222', fontWeight: 600, cursor: 'pointer', fontSize: 14
            }}
            onClick={() => { onChange(`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`); onClose(); }}
          >{day}</button>
        ) : <div key={i} />)}
      </div>
      <button onClick={onClose} style={{ marginTop: 4, fontSize: 12, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', width: '100%' }}>Close</button>
    </div>
  );
}

function LevelBadgeCircle({ eliteScore }: { eliteScore: number }) {
  const level = getLevel(eliteScore);
  // Use prevLevelXP and nextLevelXP for progress
  const progress = Math.max(0, Math.min(1, (eliteScore - level.prevLevelXP) / (level.nextLevelXP - level.prevLevelXP)));
  // Animate progress
  const [animatedProgress, setAnimatedProgress] = useState(progress);
  useEffect(() => {
    setAnimatedProgress(progress);
  }, [progress]);
  // Circle params
  const size = 48;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - animatedProgress);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 220 }}>
      <div style={{ position: 'relative', width: size, height: size }} title={`${level.title} (XP: ${eliteScore})`}>
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#xpgrad)"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,1.6,.6,1)' }}
          />
          <defs>
            <linearGradient id="xpgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <span style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 700,
          userSelect: 'none',
        }}>{level.icon}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        <span style={{ fontWeight: 700, color: '#2563eb', fontSize: 18 }}>{level.title}</span>
        <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, fontWeight: 500, fontSize: 15 }}>
          <span style={{ color: '#2563eb', fontWeight: 700 }}>XP: <b>{eliteScore}</b></span>
          <span style={{ color: '#888', fontWeight: 500, fontSize: 15, marginLeft: 2 }}>
            {level.xpToNext > 0 ? `+${level.xpToNext} XP to next` : 'Max Level'}
          </span>
        </span>
      </div>
    </div>
  );
}

function LevelUpModal({ level, onClose }: { level: { icon: string, title: string }, onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(30,40,60,0.18)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s',
    }} onClick={onClose}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 8px 32px #2563eb33',
        padding: '2.5rem 3.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        transform: 'scale(1)',
        animation: 'scaleIn 0.5s',
      }}>
        <span style={{ fontSize: 60, marginBottom: 8 }}>{level.icon}</span>
        <div style={{ fontWeight: 900, fontSize: 32, color: '#2563eb', marginBottom: 4 }}>Level Up!</div>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#222', marginBottom: 8 }}>{level.title}</div>
        <div style={{ fontSize: 16, color: '#2563eb', fontWeight: 500 }}>Keep going, you're crushing it! 🎉</div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

function AnimatedProtocolHeading() {
  const phrase = 'Awaken. Grind. Evolve. Dominate. Repeat.';
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    let typing: NodeJS.Timeout;
    let pause: NodeJS.Timeout;
    function startTyping() {
      setDisplayed('');
      typing = setInterval(() => {
        setDisplayed(phrase.slice(0, i + 1));
        i++;
        if (i >= phrase.length) {
          clearInterval(typing);
          pause = setTimeout(() => {
            i = 0;
            startTyping();
          }, 5000);
        }
      }, 32);
    }
    startTyping();
    return () => {
      clearInterval(typing);
      clearTimeout(pause);
    };
  }, []);
  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'max-content',
      maxWidth: '60vw',
      whiteSpace: 'nowrap',
      fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)',
      fontWeight: 700,
      letterSpacing: 1.1,
      textShadow: '0 2px 8px #2563eb11',
      fontFamily: 'inherit',
      minHeight: 30,
      transition: 'color 0.3s',
      zIndex: 2,
      background: 'transparent',
      pointerEvents: 'none',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    }}>
      <span style={{ color: '#2563eb', fontWeight: 700, marginRight: 10 }}>Eclipse Protocol:</span>
      <span style={{ color: '#222', fontWeight: 700, marginLeft: 2, display: 'inline-flex', alignItems: 'center' }}>
        {displayed}
        <span style={{ display: 'inline-block', width: 14, color: '#2563eb', animation: 'blink 1s steps(1) infinite' }}>|</span>
        <style>{`@keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }`}</style>
      </span>
    </div>
  );
}

export default function TopBar() {
  const { currentDate, setDate, eliteScore } = useTrackerStore();
  const [showCal, setShowCal] = useState(false);
  const [lastLevel, setLastLevel] = useState(getLevel(eliteScore).level);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const level = getLevel(eliteScore);

  useEffect(() => {
    if (level.level > lastLevel) {
      setShowLevelUp(true);
      setLastLevel(level.level);
      const timeout = setTimeout(() => setShowLevelUp(false), 2500);
      return () => clearTimeout(timeout);
    }
    if (level.level < lastLevel) setLastLevel(level.level);
  }, [eliteScore, level.level, lastLevel]);

  return (
    <>
      <header className="topbar" style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.2rem 2rem 0.5rem 2rem',
        boxSizing: 'border-box',
        gap: 0,
        background: 'linear-gradient(90deg, #f8fafc 60%, #e0e7ef 100%)',
        borderBottom: '1px solid #e5e7eb',
        minHeight: 90,
        position: 'relative',
      }}>
        {/* Left: Calendar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 180, position: 'relative' }}>
          <button style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }} title="Pick date" aria-label="Pick date" onClick={() => setShowCal(v => !v)}>
            <CalendarDaysIcon style={{ width: 28, height: 28, color: '#2563eb' }} />
          </button>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: '#222', fontFamily: 'inherit' }}>{formatDate(currentDate)}</span>
          {showCal && <CalendarDropdown value={currentDate} onChange={setDate} onClose={() => setShowCal(false)} />}
        </div>
        {/* Center: Animated Protocol Heading */}
        <div style={{
          flex: 1,
          position: 'relative',
          minWidth: 0,
          height: 60,
        }}>
          <AnimatedProtocolHeading />
        </div>
        {/* Right: Level Badge Circle */}
        <LevelBadgeCircle eliteScore={eliteScore} />
      </header>
      {showLevelUp && <LevelUpModal level={{ ...level, icon: String(level.icon), title: String(level.title) }} onClose={() => setShowLevelUp(false)} />}
    </>
  );
} 