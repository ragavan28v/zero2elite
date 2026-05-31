import { useTrackerStore } from '../store';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

// Import defaultBlocks from store
const defaultBlocks = [
  { time: '5:00–5:15 AM', label: 'Hydrate + Stretch', status: 'pending' },
  { time: '5:15–5:30 AM', label: 'Breath Meditation', status: 'pending' },
  { time: '5:30–6:00 AM', label: 'Workout', status: 'pending' },
  { time: '6:00–6:30 AM', label: 'Shower and Get Ready', status: 'pending' },
  { time: '6:30–7:30 AM', label: 'Book Reading (1 Chapter)', status: 'pending' },
  { time: '7:30–8:20 AM', label: 'AI/ML Study, Micro Blog, Tech Trends, Podcast Walk, Voice Practice', status: 'pending' },
  { time: '8:20–8:40 AM', label: 'Healthy Breakfast', status: 'pending' },
  { time: '8:40 AM–4:10 PM', label: 'College Hours', status: 'pending' },
  { time: '4:10–5:00 PM', label: 'Tea Break and Relaxation', status: 'pending' },
  { time: '5:00–8:00 PM', label: 'Build Projects (Frontend/Backend) / AI/ML Project Integration', status: 'pending' },
  { time: '8:00–8:30 PM', label: 'Dinner & Music (Recharge)', status: 'pending' },
  { time: '8:30–9:00 PM', label: 'Speech/Presentation Practice (TED-style, Record)', status: 'pending' },
  { time: '9:00–10:00 PM', label: 'Academics (Assignments, Revision, OS topics, etc.)', status: 'pending' },
  { time: '10:00–10:30 PM', label: 'Reflection & Daily Log', status: 'pending' },
  { time: '10:30–11:30 PM', label: 'Work / Movies / Personal Projects / Free Time', status: 'pending' },
  { time: '11:30 PM', label: 'Sleep', status: 'pending' },
];

export default function TaskTable() {
  const { currentDate, days, addNote, markBlock } = useTrackerStore();
  const blocks = days[currentDate]?.blocks || defaultBlocks.map(b => ({ ...b }));
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleEdit = (idx: number, note: string | undefined) => {
    setEditingIdx(idx);
    setNoteText(note || '');
  };
  const handleSave = () => {
    if (editingIdx !== null) {
      addNote(editingIdx, noteText);
      setEditingIdx(null);
      setNoteText('');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ color: '#888', fontWeight: 500 }}>
            <th style={{ textAlign: 'left', padding: '4px 8px' }}>Time</th>
            <th style={{ textAlign: 'left', padding: '4px 8px' }}>Task</th>
            <th style={{ textAlign: 'center', padding: '4px 8px' }}>Status</th>
            <th style={{ textAlign: 'center', padding: '4px 8px' }}>Note</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '4px 8px', color: '#2563eb', fontWeight: 500 }}>{block.time}</td>
              <td style={{ padding: '4px 8px', color: '#222' }}>{block.label}</td>
              <td style={{ textAlign: 'center', padding: '4px 8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <button
                    onClick={() => markBlock(i, block.status === 'done' ? 'pending' : 'done')}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    title={block.status === 'done' ? 'Mark as pending' : 'Mark as done'}
                  >
                    <CheckCircleIcon style={{ color: block.status === 'done' ? '#22c55e' : '#e5e7eb', width: 18, height: 18 }} />
                  </button>
                  <button
                    onClick={() => markBlock(i, block.status === 'skipped' ? 'pending' : 'skipped')}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    title={block.status === 'skipped' ? 'Mark as pending' : 'Mark as skipped'}
                  >
                    <XCircleIcon style={{ color: block.status === 'skipped' ? '#ef4444' : '#e5e7eb', width: 18, height: 18 }} />
                  </button>
                  <button
                    onClick={() => markBlock(i, 'pending')}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    title="Mark as pending"
                  >
                    <MinusCircleIcon style={{ color: block.status === 'pending' ? '#2563eb' : '#e5e7eb', width: 18, height: 18 }} />
                  </button>
                </span>
              </td>
              <td style={{ textAlign: 'center', padding: '4px 8px', minWidth: 80 }}>
                {editingIdx === i ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      style={{ fontSize: 12, padding: '2px 6px', borderRadius: 4, border: '1px solid #e5e7eb', width: 80 }}
                      autoFocus
                    />
                    <button onClick={handleSave} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>Save</button>
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {block.note && <span style={{ color: '#2563eb', fontSize: 12, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{block.note}</span>}
                    <button onClick={() => handleEdit(i, block.note)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} title="Add note">
                      <PencilSquareIcon style={{ width: 16, height: 16, color: '#888' }} />
                    </button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 