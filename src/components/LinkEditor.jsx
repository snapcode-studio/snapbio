import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ICON_OPTIONS = ['🌐', '📸', '🎵', '📞', '📧', '🛒', '📍', '💼', '🎥', '📅', '⭐', '💬'];

function SortableLink({ link, onChange, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const [showIcons, setShowIcons] = useState(false);

  return (
    <div ref={setNodeRef} style={style} className="link-item">
      {/* Drag Handle */}
      <span className="drag-handle" {...attributes} {...listeners}>⠿</span>

      {/* Icon Picker */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setShowIcons(!showIcons)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
        >
          {link.icon || '🌐'}
        </button>
        {showIcons && (
          <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 50, background: '#1a1a1c', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            {ICON_OPTIONS.map(ic => (
              <button key={ic} type="button" onClick={() => { onChange({ ...link, icon: ic }); setShowIcons(false); }}
                style={{ background: link.icon === ic ? 'rgba(255,255,255,0.15)' : 'transparent', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', fontSize: '18px' }}>
                {ic}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title & URL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <input
          type="text"
          placeholder="Tytuł linku (np. Mój Instagram)"
          value={link.title}
          onChange={e => onChange({ ...link, title: e.target.value })}
          style={{ marginBottom: 0, padding: '10px 14px', fontSize: '14px' }}
        />
        <input
          type="url"
          placeholder="https://..."
          value={link.url}
          onChange={e => onChange({ ...link, url: e.target.value })}
          style={{ marginBottom: 0, padding: '10px 14px', fontSize: '13px', color: 'var(--text-secondary)' }}
        />
      </div>

      {/* Delete */}
      <button type="button" onClick={() => onDelete(link.id)}
        style={{ background: 'transparent', border: '1px solid rgba(255,69,58,0.3)', color: '#ff453a', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.background = '#ff453a'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >✕</button>
    </div>
  );
}

export default function LinkEditor({ links, setLinks }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addLink = () => {
    const id = Math.random().toString(36).slice(2, 9);
    setLinks([...links, { id, title: '', url: '', icon: '🌐', order: links.length }]);
  };

  const updateLink = (updated) => setLinks(links.map(l => l.id === updated.id ? updated : l));
  const deleteLink = (id) => setLinks(links.filter(l => l.id !== id));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIdx = links.findIndex(l => l.id === active.id);
      const newIdx = links.findIndex(l => l.id === over.id);
      setLinks(arrayMove(links, oldIdx, newIdx));
    }
  };

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {links.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px', border: '1px dashed var(--border-light)', borderRadius: '16px' }}>
                Brak linków. Kliknij "Dodaj link" aby zacząć.
              </div>
            )}
            {links.map(link => (
              <SortableLink key={link.id} link={link} onChange={updateLink} onDelete={deleteLink} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button type="button" className="btn btn-secondary" onClick={addLink} style={{ fontSize: '14px', padding: '12px' }}>
        + Dodaj link
      </button>
    </div>
  );
}
