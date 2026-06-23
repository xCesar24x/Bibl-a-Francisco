import React, { useState } from 'react';
import { booksMetadata } from '../data/booksMetadata';
import bibleData from '../data/bible.json';
import { BookOpen, Search, ArrowRight } from 'lucide-react';

export default function BibleSelector({ onSelectChapter }) {
  const [activeTestament, setActiveTestament] = useState('Antiguo');
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  // Obtener la cantidad de capítulos de un libro en el JSON
  const getChapterCount = (bookKey) => {
    const bookObj = bibleData[bookKey];
    if (!bookObj) return 0;
    return Object.keys(bookObj).filter(k => !isNaN(k)).length;
  };

  // Normalizar texto para búsquedas sin acentos
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setSearchVal(''); // Limpiar búsqueda al entrar al libro
  };

  const handleChapterClick = (chapterNum) => {
    onSelectChapter(selectedBook, parseInt(chapterNum));
    setSelectedBook(null);
    setSearchVal('');
  };

  // Generar sugerencias dinámicas según el texto escrito
  const getSuggestions = () => {
    if (!searchVal.trim()) return [];
    const normalizedQuery = normalizeText(searchVal.trim());
    const suggestions = [];

    // Buscar coincidencia de cita directa: ej. "Juan 3", "Salmo 23", "Salmo 23:1"
    const refMatch = searchVal.match(/^([1-3]?\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ\.\s]+?)(?:\s+(\d+))?(?::(\d+))?$/);
    
    // Buscar libros que coincidan parcialmente
    const matchedBooks = booksMetadata.filter(b => 
      normalizeText(b.name).includes(normalizedQuery) || 
      normalizeText(b.key).includes(normalizedQuery)
    );

    if (refMatch) {
      const bookQuery = normalizeText(refMatch[1]);
      const chapterQuery = refMatch[2];
      const verseQuery = refMatch[3];

      const bestBookMatch = booksMetadata.find(b => 
        normalizeText(b.name).startsWith(bookQuery) || 
        normalizeText(b.key).startsWith(bookQuery) ||
        normalizeText(b.name).includes(bookQuery)
      );

      if (bestBookMatch) {
        if (chapterQuery) {
          const maxChapters = getChapterCount(bestBookMatch.key);
          const chNum = parseInt(chapterQuery);
          if (chNum > 0 && chNum <= maxChapters) {
            if (verseQuery) {
              suggestions.push({
                type: 'verse',
                label: `Ir a ${bestBookMatch.name} ${chapterQuery}:${verseQuery}`,
                book: bestBookMatch,
                chapter: chNum,
                verse: verseQuery
              });
            } else {
              suggestions.push({
                type: 'chapter',
                label: `Leer ${bestBookMatch.name} ${chapterQuery}`,
                book: bestBookMatch,
                chapter: chNum
              });
            }
          }
        }
      }
    }

    // Agregar sugerencias de libros rápidos encontrados
    matchedBooks.slice(0, 4).forEach(book => {
      suggestions.push({
        type: 'book',
        label: `Ver capítulos de ${book.name}`,
        book: book
      });
      
      // Si es un libro popular como Salmos o Juan, agregar sugerencias rápidas
      if (book.key === 'Salmos') {
        suggestions.push(
          { type: 'chapter', label: 'Salmo 23 (El Señor es mi Pastor)', book: book, chapter: 23 },
          { type: 'chapter', label: 'Salmo 91 (Morando bajo la sombra del Omnipotente)', book: book, chapter: 91 },
          { type: 'chapter', label: 'Salmo 100 (Cantad alegres a Dios)', book: book, chapter: 100 }
        );
      } else if (book.key === 'S.Juan') {
        suggestions.push(
          { type: 'verse', label: 'Juan 3:16 (Porque de tal manera amó Dios...)', book: book, chapter: 3, verse: '16' }
        );
      }
    });

    // Remover duplicados en etiquetas
    const uniqueLabels = new Set();
    return suggestions.filter(s => {
      if (uniqueLabels.has(s.label)) return false;
      uniqueLabels.add(s.label);
      return true;
    }).slice(0, 5); // Limitar a 5 sugerencias
  };

  const handleSuggestionClick = (sug) => {
    if (sug.type === 'book') {
      setSelectedBook(sug.book);
    } else if (sug.type === 'chapter') {
      onSelectChapter(sug.book, sug.chapter);
    } else if (sug.type === 'verse') {
      // Usar selector de versículo directamente (provoca scroll al versículo)
      onSelectChapter(sug.book, sug.chapter);
      // Guardar en localStorage para que el lector haga scroll
      setTimeout(() => {
        const elements = document.getElementsByClassName('verse-block');
        for (let el of elements) {
          const vNumSpan = el.querySelector('.verse-number');
          if (vNumSpan && vNumSpan.textContent === sug.verse.toString()) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.click();
            break;
          }
        }
      }, 300);
    }
    setSearchVal('');
  };

  // Filtrar los libros de la grilla según la búsqueda
  const getFilteredBooksGrid = () => {
    const testamentBooks = booksMetadata.filter(b => b.testament === activeTestament);
    if (!searchVal.trim()) return testamentBooks;

    const query = normalizeText(searchVal.trim());
    return booksMetadata.filter(b => 
      normalizeText(b.name).includes(query) || 
      normalizeText(b.key).includes(query)
    );
  };

  const suggestions = getSuggestions();
  const visibleBooks = getFilteredBooksGrid();

  return (
    <div>
      {!selectedBook ? (
        // Pantalla de Selección de Libro
        <div>
          {/* Buscador Superior con Autocompletado */}
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <div className="search-input-wrapper">
              <Search className="search-icon-inside" size={22} />
              <input
                type="text"
                className="search-input"
                placeholder="Busca un libro o pasaje (ej. Salmos 23, Juan 3:16)..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                style={{ padding: '0.9rem 1.2rem 0.9rem 2.8rem', fontSize: '1rem', borderRadius: '14px' }}
              />
            </div>

            {/* Panel de Sugerencias Predeterminadas */}
            {suggestions.length > 0 && (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  marginTop: '0.4rem', 
                  boxShadow: 'var(--shadow-lg)', 
                  zIndex: 200,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                  Sugerencias rápidas:
                </div>
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(sug)}
                    style={{ 
                      width: '100%', 
                      padding: '0.8rem 1rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      border: 'none', 
                      background: 'none', 
                      textAlign: 'left', 
                      fontFamily: 'var(--font-sans)', 
                      fontSize: '0.95rem', 
                      color: 'var(--text-main)', 
                      cursor: 'pointer',
                      borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span>{sug.label}</span>
                    <ArrowRight size={16} style={{ color: 'var(--accent-color)' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selector de Testamento (solo si no se está buscando) */}
          {!searchVal.trim() && (
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
          )}

          <h3 className="selector-title">
            {searchVal.trim() ? 'Libros encontrados:' : 'Selecciona un Libro:'}
          </h3>

          {visibleBooks.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              No se encontraron libros que coincidan con tu búsqueda.
            </div>
          ) : (
            <div className="selector-grid">
              {visibleBooks.map((book) => (
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
          )}
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
