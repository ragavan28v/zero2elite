import React, { useState, useEffect } from 'react';
import { useTrackerStore } from '../store';

export default function DailyJournal({ compact = false }: { compact?: boolean }) {
  const { currentDate, days, setJournal } = useTrackerStore();
  const journal = days[currentDate]?.journal || '';
  const [entry, setEntry] = useState(journal);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState(journal);

  useEffect(() => {
    setEntry(journal);
    setModalValue(journal);
  }, [journal, currentDate]);

  const handleSave = () => {
    setJournal(entry);
  };

  const openModal = () => {
    setModalValue(entry);
    setModalOpen(true);
  };

  const handleModalSave = () => {
    setEntry(modalValue);
    setJournal(modalValue);
    setModalOpen(false);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
  };

  return (
    <section style={{
      width: '100%',
      maxWidth: compact ? 320 : 800,
      margin: 0,
      padding: compact ? '0.2rem 0 0.4rem 0' : '2rem',
      background: 'none',
      borderRadius: 0,
      boxShadow: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? 6 : 16,
      fontSize: compact ? 14 : 18,
      borderTop: compact ? '1px solid #e5e7eb' : undefined,
    }}>
      <h3 style={{ fontSize: compact ? 16 : 24, fontWeight: 700, marginBottom: compact ? 2 : 8 }}>📝 Daily Journal</h3>
      <div style={{ position: 'relative', width: '100%' }}>
        <textarea
          value={entry}
          onChange={e => setEntry(e.target.value)}
          placeholder="Reflect on your day, lessons, wins, or challenges..."
          style={{ width: '100%', minHeight: compact ? 60 : 100, fontSize: compact ? 13 : 18, padding: compact ? 6 : 12, borderRadius: 8, border: '1px solid #e5e7eb', resize: 'vertical', marginBottom: compact ? 4 : 8, cursor: 'pointer' }}
          onFocus={openModal}
          readOnly
          aria-label="Edit daily journal"
        />
        <button
          onClick={openModal}
          style={{ position: 'absolute', right: 8, top: 8, background: '#e0e7ef', border: 'none', borderRadius: 6, padding: '2px 10px', fontSize: 14, cursor: 'pointer', color: '#2563eb' }}
          title="Expand journal editor"
          aria-label="Expand journal editor"
        >
          ⬈
        </button>
      </div>
      {/* Modal for fullscreen editing */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(30,40,60,0.18)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 32px #2563eb33',
            padding: 32,
            maxWidth: 600,
            width: '90vw',
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 0 }}>📝 Daily Journal</h3>
            <textarea
              value={modalValue}
              onChange={e => setModalValue(e.target.value)}
              placeholder="Reflect on your day, lessons, wins, or challenges..."
              style={{ width: '100%', minHeight: 180, fontSize: 18, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', resize: 'vertical' }}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={handleModalCancel}
                style={{ background: '#e5e7eb', color: '#222', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '8px 24px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSave}
                style={{ background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '8px 24px', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
} 