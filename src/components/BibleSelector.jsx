import React, { useState } from 'react';
import { booksMetadata } from '../data/booksMetadata';
import bibleData from '../data/bible.json';
import { BookOpen } from 'lucide-react';

export default function BibleSelector({ onSelectChapter }) {
  const [activeTestament, setActiveTestament] = useState('Antiguo');
  const [selectedBook, setSelectedBook] = useState(null);

  const filteredBooks = booksMetadata.filter(b => b.testament === activeTestament);

  // Obtener la cantidad de capítulos de un libro en el JSON
  const getChapterCount = (bookKey) => {
    const bookObj = bibleData[bookKey];
    if (!bookObj) return 0;
    // Filtrar llaves numéricas por si hay metadatos
    return Object.keys(bookObj).filter(k => !isNaN(k)).length;
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  const handleChapterClick = (chapterNum) => {
    onSelectChapter(selectedBook, parseInt(chapterNum));
    // Resetear selección para que cuando vuelva a la pestaña de libros pueda elegir otro
    setSelectedBook(null);
  };

  return (
    <div>
      {!selectedBook ? (
        // Pantalla de Selección de Libro
        <div>
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTestament === 'Antiguo' ? 'active' : ''}`}
              onClick={() => setActiveTestament('Antiguo')}
              style={{ fontSize: '1.1rem', padding: '0.8rem' }}
            >
              Antiguo Testamento
            </button>
            <button
              className={`tab-btn ${activeTestament === 'Nuevo' ? 'active' : ''}`}
              onClick={() => setActiveTestament('Nuevo')}
              style={{ fontSize: '1.1rem', padding: '0.8rem' }}
            >
              Nuevo Testamento
            </button>
          </div>

          <h3 className="selector-title">Selecciona un Libro:</h3>
          <div className="selector-grid">
            {filteredBooks.map((book) => (
              <button
                key={book.key}
                className="selector-card"
                onClick={() => handleBookClick(book)}
              >
                <BookOpen size={20} style={{ marginBottom: '4px', color: 'var(--accent-color)' }} />
                <span>{book.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Pantalla de Selección de Capítulo
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedBook.name}</h2>
            <button className="btn-secondary" onClick={() => setSelectedBook(null)} style={{ padding: '0.5rem 1rem' }}>
              Atrás a Libros
            </button>
          </div>

          <h3 className="selector-title">Selecciona un Capítulo:</h3>
          <div className="chapters-grid">
            {Array.from({ length: getChapterCount(selectedBook.key) }, (_, i) => i + 1).map((chapterNum) => (
              <button
                key={chapterNum}
                className="chapter-btn"
                onClick={() => handleChapterClick(chapterNum)}
              >
                {chapterNum}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
