import { useTrackerStore } from '../store';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function TaskTable() {
  const { currentDate, days, addNote, markBlock } = useTrackerStore();
  const blocks = days[currentDate]?.blocks || [];
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