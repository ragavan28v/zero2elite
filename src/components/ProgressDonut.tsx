import { useTrackerStore } from '../store';

export default function ProgressDonut() {
  const { currentDate, days } = useTrackerStore();
  const blocks = days[currentDate]?.blocks || [];
  const done = blocks.filter(b => b.status === 'done').length;
  const skipped = blocks.filter(b => b.status === 'skipped').length;
  const total = blocks.length;
  const percentDone = total ? (done / total) * 100 : 0;
  const percentSkipped = total ? (skipped / total) * 100 : 0;

  const size = 140;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;

  const arc = (percent: number) => (circ * percent) / 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: size }} title="Task Completion Progress" aria-label="Task Completion Progress">
      <svg width={size} height={size} style={{ marginBottom: 8 }}>
        {/* Pending (gray, bottom layer) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        {/* Skipped (red) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth={stroke}
          strokeDasharray={arc(percentSkipped) + ' ' + circ}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
        />
        {/* Done (green) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={stroke}
          strokeDasharray={arc(percentDone) + ' ' + circ}
          strokeDashoffset={circ * 0.25 + arc(percentSkipped)}
          strokeLinecap="round"
        />
        <text
          x="50%"
          y="54%"
          textAnchor="middle"
          fontSize="2.2rem"
          fill="#222"
          fontWeight={700}
        >
          {done}
        </text>
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          fontSize="1rem"
          fill="#888"
          fontWeight={500}
        >
          Done
        </text>
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <span style={{ color: '#22c55e', fontWeight: 600 }}>Done: {done}</span>
        <span style={{ color: '#ef4444', fontWeight: 600 }}>Skipped: {skipped}</span>
        <span style={{ color: '#888', fontWeight: 500 }}>Total: {total}</span>
      </div>
    </div>
  );
} 