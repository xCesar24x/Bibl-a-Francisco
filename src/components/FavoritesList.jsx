import React, { useState } from 'react';
import { Bookmark, History, Trash2, BookOpen } from 'lucide-react';

export default function FavoritesList({ 
  favorites, 
  onRemoveFavorite, 
  history, 
  onClearHistory, 
  onSelectVerse,
  notes
}) {
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' o 'history'

  const handleFavoriteClick = (fav) => {
    // fav.bookKey, fav.chapter, fav.verseNumber
    onSelectVerse(fav.book, fav.chapter, fav.verseNumber);
  };

  const handleHistoryClick = (hist) => {
    onSelectVerse(hist.book, hist.chapter, null);
  };

  return (
    <div>
      {/* Selector de Pestañas */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
          style={{ fontSize: '1.1rem', padding: '0.8rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Bookmark size={20} />
            Mis Favoritos
          </div>
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          style={{ fontSize: '1.1rem', padding: '0.8rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <History size={20} />
            Leídos Recientes
          </div>
        </button>
      </div>

      {activeTab === 'favorites' ? (
        // Sección de Favoritos
        <div>
          {favorites.length === 0 ? (
            <div className="empty-state">
              <Bookmark size={48} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Aún no tienes favoritos</p>
              <p style={{ fontSize: '0.95rem' }}>
                Cuando estés leyendo la Biblia, toca cualquier versículo y presiona "Guardar Favorito" para verlo aquí.
              </p>
            </div>
          ) : (
            <div className="results-list">
              {favorites.map((fav, idx) => {
                const noteKey = `${fav.bookKey}_${fav.chapter}_${fav.verseNumber}`;
                const hasNote = notes[noteKey];

                return (
                  <div
                    key={`${fav.bookKey}_${fav.chapter}_${fav.verseNumber}_${idx}`}
                    className="result-card"
                    style={{ position: 'relative', paddingRight: '3.5rem' }}
                  >
                    <div onClick={() => handleFavoriteClick(fav)}>
                      <div className="result-ref">
                        {fav.bookName} {fav.chapter}:{fav.verseNumber}
                      </div>
                      <p className="result-text" style={{ fontStyle: 'italic' }}>
                        "{fav.text}"
                      </p>

                      {hasNote && (
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)', fontSize: '0.9rem' }}>
                          <span style={{ fontWeight: 600, display: 'block', marginBottom: '2px', color: 'var(--text-muted)' }}>Mi nota:</span>
                          {notes[noteKey]}
                        </div>
                      )}
                    </div>

                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(fav);
                      }}
                      style={{ 
                        position: 'absolute', 
                        right: '0.75rem', 
                        top: '0.75rem',
                        color: '#ef4444' 
                      }}
                      title="Eliminar Favorito"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Sección de Historial
        <div>
          {history.length === 0 ? (
            <div className="empty-state">
              <History size={48} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Sin historial de lectura</p>
              <p style={{ fontSize: '0.95rem' }}>Los capítulos que leas aparecerán listados aquí para que vuelvas a ellos rápido.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button 
                  className="btn-secondary" 
                  onClick={onClearHistory} 
                  style={{ color: '#ef4444', borderColor: '#fee2e2', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                >
                  <Trash2 size={16} />
                  Limpiar Historial
                </button>
              </div>

              <div className="results-list">
                {history.map((hist, idx) => (
                  <div
                    key={`${hist.book.key}_${hist.chapter}_${idx}`}
                    className="result-card"
                    onClick={() => handleHistoryClick(hist)}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    <BookOpen size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                        {hist.book.name} {hist.chapter}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Leído el {new Date(hist.timestamp).toLocaleDateString()} a las {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
