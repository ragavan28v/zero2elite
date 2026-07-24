import {
  ArrowPathIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  TrashIcon,
  XCircleIcon,
  MinusCircleIcon,
} from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { defaultBlocks, type Block, useTrackerStore } from '../store';

function cloneDefaultBlocks() {
  return defaultBlocks.map((block) => ({ ...block }));
}

export default function TaskTable() {
  const {
    currentDate,
    days,
    scheduleTemplate,
    addNote,
    markBlock,
    updateBlock,
    addBlock,
    removeBlock,
    restoreDefaultSchedule,
    setScheduleTemplate,
    restoreMasterSchedule,
    templateEditorOpen,
    closeTemplateEditor,
    scheduleCustomizationActive,
    saveScheduleCustomization,
    cancelScheduleCustomization,
  } = useTrackerStore();

  const blocks = days[currentDate]?.blocks || cloneDefaultBlocks();
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [templateDraft, setTemplateDraft] = useState<Block[]>(cloneDefaultBlocks());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (templateEditorOpen) {
      setTemplateDraft(scheduleTemplate.map((block) => ({ ...block })));
    }
  }, [scheduleTemplate, templateEditorOpen]);

  const handleEditNote = (idx: number, note: string | undefined) => {
    setEditingIdx(idx);
    setNoteText(note || '');
  };

  const handleSaveNote = () => {
    if (editingIdx !== null) {
      addNote(editingIdx, noteText);
      setEditingIdx(null);
      setNoteText('');
    }
  };

  const handleResetSchedule = () => {
    restoreDefaultSchedule();
    setEditingIdx(null);
    setNoteText('');
  };

  const handleAddBlock = () => {
    addBlock({
      time: '12:00 PM',
      label: 'New custom block',
      status: 'pending',
    });
  };

  const handleUpdateField = (idx: number, field: 'time' | 'label', value: string) => {
    updateBlock(idx, { [field]: value });
  };

  const handleRemoveBlock = (idx: number) => {
    removeBlock(idx);
    if (editingIdx === idx) {
      setEditingIdx(null);
      setNoteText('');
    }
  };

  const handleTemplateField = (idx: number, field: 'time' | 'label', value: string) => {
    setTemplateDraft((prev) =>
      prev.map((block, index) => (index === idx ? { ...block, [field]: value } : block)),
    );
  };

  const handleTemplateAdd = () => {
    setTemplateDraft((prev) => [
      ...prev,
      { time: '12:00 PM', label: 'New template block', status: 'pending' },
    ]);
  };

  const handleTemplateRemove = (idx: number) => {
    setTemplateDraft((prev) => {
      const next = prev.filter((_, index) => index !== idx);
      return next.length > 0 ? next : cloneDefaultBlocks();
    });
  };

  const handleTemplateSave = () => {
    const nextTemplate = templateDraft.map((block) => ({ ...block, status: 'pending' as const }));
    setScheduleTemplate(nextTemplate);
    restoreDefaultSchedule();
    closeTemplateEditor();
  };

  const handleTemplateReset = () => {
    const master = cloneDefaultBlocks();
    setTemplateDraft(master);
    restoreMasterSchedule();
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 12 : 12,
          marginBottom: isMobile ? 12 : 12,
          padding: isMobile ? '10px 12px' : '10px 12px',
          borderRadius: isMobile ? 14 : 14,
          background: isMobile ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.72)',
          border: isMobile ? '1px solid rgba(37, 99, 235, 0.12)' : '1px solid rgba(37, 99, 235, 0.12)',
          backdropFilter: isMobile ? 'blur(10px)' : 'blur(10px)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          {scheduleCustomizationActive && (
            <>
              <button
                onClick={handleAddBlock}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 36,
                  minHeight: 36,
                  padding: '0 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(34, 197, 94, 0.18)',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flex: isMobile ? '1 1 0' : '0 0 auto',
                }}
              >
                <PlusCircleIcon style={{ width: 16, height: 16 }} />
                {isMobile ? 'Add' : 'Add block'}
              </button>

              <button
                onClick={handleResetSchedule}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 36,
                  minHeight: 36,
                  padding: '0 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(239, 68, 68, 0.18)',
                  background: '#fff1f2',
                  color: '#dc2626',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flex: isMobile ? '1 1 0' : '0 0 auto',
                }}
              >
                <ArrowPathIcon style={{ width: 16, height: 16 }} />
                {isMobile ? 'Reset' : 'Restore template'}
              </button>

              <button
                onClick={saveScheduleCustomization}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 36,
                  minHeight: 36,
                  padding: '0 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(34, 197, 94, 0.18)',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flex: isMobile ? '1 1 0' : '0 0 auto',
                }}
              >
                Save changes
              </button>

              <button
                onClick={cancelScheduleCustomization}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 36,
                  minHeight: 36,
                  padding: '0 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(107, 114, 128, 0.18)',
                  background: '#fff',
                  color: '#374151',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flex: isMobile ? '1 1 0' : '0 0 auto',
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {blocks.map((block, i) => (
            <div
              key={`${currentDate}-${i}-${block.time}-${block.label}`}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 18,
                padding: '14px 14px 12px',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 12, letterSpacing: 0.2 }}>
                      {scheduleCustomizationActive ? (
                        <input
                          value={block.time}
                          onChange={(e) => handleUpdateField(i, 'time', e.target.value)}
                          style={{
                            width: 92,
                            fontSize: 12,
                            padding: '5px 7px',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                            outline: 'none',
                            color: '#2563eb',
                            fontWeight: 700,
                            background: '#f8fafc',
                          }}
                        />
                      ) : (
                        block.time
                      )}
                    </div>
                    <div style={{ color: '#374151', fontWeight: 500, fontSize: 12, lineHeight: 1.5, wordBreak: 'break-word', flex: 1 }}>
                      {scheduleCustomizationActive ? (
                        <input
                          value={block.label}
                          onChange={(e) => handleUpdateField(i, 'label', e.target.value)}
                          style={{
                            width: '100%',
                            fontSize: 12,
                            padding: '5px 7px',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                            outline: 'none',
                            color: '#111827',
                            fontWeight: 500,
                            background: '#fff',
                          }}
                        />
                      ) : (
                        block.label
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleEditNote(i, block.note)}
                  style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  title="Add note"
                >
                  <PencilSquareIcon style={{ width: 18, height: 18, color: '#8b8b8b' }} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => markBlock(i, block.status === 'done' ? 'pending' : 'done')}
                  style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={block.status === 'done' ? 'Mark as pending' : 'Mark as done'}
                >
                  <CheckCircleIcon style={{ color: block.status === 'done' ? '#22c55e' : '#e5e7eb', width: 22, height: 22 }} />
                </button>
                <button
                  onClick={() => markBlock(i, block.status === 'skipped' ? 'pending' : 'skipped')}
                  style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={block.status === 'skipped' ? 'Mark as pending' : 'Mark as skipped'}
                >
                  <XCircleIcon style={{ color: block.status === 'skipped' ? '#ef4444' : '#e5e7eb', width: 22, height: 22 }} />
                </button>
                <button
                  onClick={() => markBlock(i, 'pending')}
                  style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Mark as pending"
                >
                  <MinusCircleIcon style={{ color: block.status === 'pending' ? '#2563eb' : '#e5e7eb', width: 22, height: 22 }} />
                </button>
                {scheduleCustomizationActive && (
                  <button
                    onClick={() => handleRemoveBlock(i)}
                    style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}
                    title="Remove block"
                  >
                    <TrashIcon style={{ width: 18, height: 18, color: '#dc2626' }} />
                  </button>
                )}
              </div>

              {editingIdx === i && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    style={{
                      fontSize: 12,
                      padding: '7px 8px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      flex: '1 1 100%',
                      minWidth: 0,
                    }}
                    autoFocus
                    placeholder="Note"
                  />
                  <button
                    onClick={handleSaveNote}
                    style={{
                      fontSize: 12,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#2563eb',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ color: '#888', fontWeight: 500 }}>
              <th style={{ textAlign: 'left', padding: '4px 8px', width: '16%' }}>Time</th>
              <th style={{ textAlign: 'left', padding: '4px 8px', width: '48%' }}>Task</th>
              <th style={{ textAlign: 'center', padding: '4px 8px', width: '16%' }}>Status</th>
              <th style={{ textAlign: 'center', padding: '4px 8px', width: '20%' }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block, i) => (
              <tr key={`${currentDate}-${i}-${block.time}-${block.label}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '4px 8px', color: '#2563eb', fontWeight: 500 }}>
                  {scheduleCustomizationActive ? (
                    <input
                      value={block.time}
                      onChange={(e) => handleUpdateField(i, 'time', e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: 12,
                        padding: '6px 8px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        outline: 'none',
                        color: '#2563eb',
                        fontWeight: 600,
                      }}
                    />
                  ) : (
                    block.time
                  )}
                </td>
                <td style={{ padding: '4px 8px', color: '#222' }}>
                  {scheduleCustomizationActive ? (
                    <input
                      value={block.label}
                      onChange={(e) => handleUpdateField(i, 'label', e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: 12,
                        padding: '6px 8px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        outline: 'none',
                        color: '#111827',
                        fontWeight: 500,
                      }}
                    />
                  ) : (
                    block.label
                  )}
                </td>
                <td style={{ textAlign: 'center', padding: '4px 8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
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
                <td style={{ textAlign: 'center', padding: '4px 8px', minWidth: 120 }}>
                  {editingIdx === i ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        style={{
                          fontSize: 12,
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid #e5e7eb',
                          width: 80,
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveNote}
                        style={{
                          fontSize: 12,
                          padding: '2px 8px',
                          borderRadius: 4,
                          border: 'none',
                          background: '#2563eb',
                          color: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                      {block.note && (
                        <span
                          style={{
                            color: '#2563eb',
                            fontSize: 12,
                            maxWidth: 88,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={block.note}
                        >
                          {block.note}
                        </span>
                      )}
                      <button
                        onClick={() => handleEditNote(i, block.note)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        title="Add note"
                      >
                        <PencilSquareIcon style={{ width: 16, height: 16, color: '#888' }} />
                      </button>
                      {scheduleCustomizationActive && (
                        <button
                          onClick={() => handleRemoveBlock(i)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          title="Remove block"
                        >
                          <TrashIcon style={{ width: 16, height: 16, color: '#dc2626' }} />
                        </button>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {scheduleCustomizationActive && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280' }}>
          Edit the timing and task title inline. Notes and status still work the same way, so the layout stays familiar while the schedule becomes yours.
        </div>
      )}

      {templateEditorOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.42)',
            backdropFilter: 'blur(10px)',
            zIndex: 2500,
            display: 'grid',
            placeItems: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: 'min(1100px, 100%)',
              maxHeight: '90vh',
              overflow: 'auto',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))',
              borderRadius: 24,
              border: '1px solid rgba(37, 99, 235, 0.14)',
              boxShadow: '0 30px 80px rgba(15, 23, 42, 0.24)',
              padding: 24,
              display: 'grid',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: '#7c3aed', textTransform: 'uppercase' }}>
                  Personal template
                </div>
                <h3 style={{ margin: '6px 0 6px 0', fontSize: '1.4rem', color: '#111827' }}>
                  Shape the baseline your days will return to
                </h3>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
                  This becomes your own default schedule. Day-level edits can still override a single day, and restore will bring you back here.
                </p>
              </div>

              <button
                onClick={closeTemplateEditor}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#6b7280',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 8,
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={handleTemplateAdd}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(34, 197, 94, 0.18)',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <PlusCircleIcon style={{ width: 16, height: 16 }} />
                Add template block
              </button>

              <button
                onClick={handleTemplateReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(239, 68, 68, 0.18)',
                  background: '#fff1f2',
                  color: '#dc2626',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <ArrowPathIcon style={{ width: 16, height: 16 }} />
                Reset to master plan
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ color: '#888', fontWeight: 500 }}>
                    <th style={{ textAlign: 'left', padding: '4px 8px', width: '18%' }}>Time</th>
                    <th style={{ textAlign: 'left', padding: '4px 8px', width: '48%' }}>Task</th>
                    <th style={{ textAlign: 'center', padding: '4px 8px', width: '14%' }}>Status</th>
                    <th style={{ textAlign: 'center', padding: '4px 8px', width: '20%' }}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {templateDraft.map((block, i) => (
                    <tr key={`template-${i}-${block.time}-${block.label}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '4px 8px' }}>
                        <input
                          value={block.time}
                          onChange={(e) => handleTemplateField(i, 'time', e.target.value)}
                          style={{
                            width: '100%',
                            fontSize: 12,
                            padding: '6px 8px',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                            outline: 'none',
                            color: '#2563eb',
                            fontWeight: 600,
                          }}
                        />
                      </td>
                      <td style={{ padding: '4px 8px' }}>
                        <input
                          value={block.label}
                          onChange={(e) => handleTemplateField(i, 'label', e.target.value)}
                          style={{
                            width: '100%',
                            fontSize: 12,
                            padding: '6px 8px',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                            outline: 'none',
                            color: '#111827',
                            fontWeight: 500,
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', padding: '4px 8px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: 'rgba(37, 99, 235, 0.08)',
                            color: '#2563eb',
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          Pending
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '4px 8px' }}>
                        <button
                          onClick={() => handleTemplateRemove(i)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          title="Remove template block"
                        >
                          <TrashIcon style={{ width: 16, height: 16, color: '#dc2626' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={closeTemplateEditor}
                style={{
                  border: '1px solid rgba(107,114,128,0.18)',
                  background: '#fff',
                  color: '#374151',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleTemplateSave}
                style={{
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 12px 24px rgba(37,99,235,0.22)',
                }}
              >
                Save template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
