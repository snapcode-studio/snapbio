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



const getIconForUrl = (url) => {
  try {
    let u = url;
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      u = 'https://' + u;
    }
    const parsed = new URL(u);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
  } catch (e) {
    return '🌐';
  }
};

function SortableLink({ link, onChange, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isHeader = link.type === 'header';
  const isSnapMenu = link.type === 'snapmenu';

  return (
    <div ref={setNodeRef} style={style} className="link-item">
      {/* Drag Handle */}
      <span className="drag-handle" {...attributes} {...listeners}>⠿</span>

      {/* Editor Content */}
      {isHeader ? (
        // Header Editor
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input
            type="text"
            placeholder="Nagłówek sekcji (np. Moje Social Media)"
            value={link.title}
            onChange={e => onChange({ ...link, title: e.target.value })}
            style={{ marginBottom: 0, padding: '10px 14px', fontSize: '15px', fontWeight: 'bold' }}
          />
        </div>
      ) : isSnapMenu ? (
        // SnapMenu Editor
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, alignSelf: 'flex-start' }}>
            🍽️ Widget SnapMenu
          </div>
          <input
            type="text"
            placeholder="Tekst przycisku (np. Nasze Menu)"
            value={link.title}
            onChange={e => onChange({ ...link, title: e.target.value })}
            style={{ marginBottom: 0, padding: '10px 14px', fontSize: '14px' }}
          />
        </div>
      ) : (
        // Link Editor
        <>
          <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
            {link.icon && link.icon.startsWith('http') ? (
              <img src={link.icon} alt="" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
            ) : (
              <span style={{ fontSize: '20px' }}>{link.icon || '🌐'}</span>
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              type="text"
              placeholder="Tytuł linku (np. Mój YouTube)"
              value={link.title}
              onChange={e => onChange({ ...link, title: e.target.value })}
              style={{ marginBottom: 0, padding: '10px 14px', fontSize: '14px' }}
            />
            <input
              type="url"
              placeholder="https://..."
              value={link.url}
              onChange={e => {
                const newUrl = e.target.value;
                const newIcon = getIconForUrl(newUrl);
                onChange({ ...link, url: newUrl, icon: newIcon });
              }}
              style={{ marginBottom: 0, padding: '10px 14px', fontSize: '13px', color: 'var(--text-secondary)' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={link.halfWidth || false} 
                  onChange={e => onChange({ ...link, halfWidth: e.target.checked })} 
                />
                Rozmiar: Połowa (Dwa w rzędzie)
              </label>
            </div>
          </div>
        </>
      )}

      {/* Delete */}
      <button type="button" onClick={() => onDelete(link.id)}
        style={{ background: 'transparent', border: '1px solid rgba(255,69,58,0.3)', color: '#ff453a', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.background = '#ff453a'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >✕</button>
    </div>
  );
}

export default function LinkEditor({ links, setLinks, hasSnapMenu }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addLink = () => {
    const id = Math.random().toString(36).slice(2, 9);
    setLinks([...links, { id, type: 'link', title: '', url: '', icon: '🌐' }]);
  };

  const addHeader = () => {
    const id = Math.random().toString(36).slice(2, 9);
    setLinks([...links, { id, type: 'header', title: '' }]);
  };

  const addSnapMenu = () => {
    if (links.some(l => l.type === 'snapmenu')) return; // Max 1 SnapMenu widget
    const id = Math.random().toString(36).slice(2, 9);
    setLinks([...links, { id, type: 'snapmenu', title: 'Nasze Menu' }]);
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
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={addLink} style={{ flex: 1, minWidth: '120px', fontSize: '14px', padding: '12px' }}>
          + Dodaj link
        </button>
        <button type="button" className="btn btn-secondary" onClick={addHeader} style={{ flex: 1, minWidth: '120px', fontSize: '14px', padding: '12px', background: 'transparent' }}>
          + Dodaj nagłówek
        </button>
        {hasSnapMenu && !links.some(l => l.type === 'snapmenu') && (
          <button type="button" className="btn btn-secondary" onClick={addSnapMenu} style={{ flex: '1 1 100%', fontSize: '14px', padding: '12px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid #4ade80' }}>
            + Dodaj Widget SnapMenu
          </button>
        )}
      </div>
    </div>
  );
}
