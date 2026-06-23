import React, { useState, useEffect } from 'react';
import bibleData from '../data/bible.json';
import { booksMetadata } from '../data/booksMetadata';
import { Search, BookOpen } from 'lucide-react';

export default function BibleSearch({ onSelectVerse }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    setSearching(true);
    const delayDebounceFn = setTimeout(() => {
      performSearch(query);
      setSearching(false);
    }, 300); // Pequeño debounce para no saturar mientras escribe

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Función para normalizar texto (quitar acentos y poner en minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const performSearch = (searchVal) => {
    const normalizedQuery = normalizeText(searchVal.trim());
    const matchedResults = [];

    // 1. Intentar detectar si es una cita directa (ej. "Juan 3:16" o "Juan 3")
    // Regex para buscar: [Nombre Libro] [Capítulo]:[Versículo] o [Nombre Libro] [Capítulo]
    // Admite nombres que empiezan con números como "1 Corintios 13" o "1 Corintios 13:4"
    const refMatch = searchVal.match(/^([1-3]?\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ\.\s]+?)\s+(\d+)(?::(\d+))?$/);

    if (refMatch) {
      const bookQuery = normalizeText(refMatch[1]);
      const chapterQuery = refMatch[2];
      const verseQuery = refMatch[3];

      // Buscar si el libro coincide con alguno de nuestros metadatos
      const matchedBook = booksMetadata.find(b => 
        normalizeText(b.name).includes(bookQuery) || 
        normalizeText(b.key).includes(bookQuery)
      );

      if (matchedBook && bibleData[matchedBook.key]) {
        const bookObj = bibleData[matchedBook.key];
        
        if (bookObj[chapterQuery]) {
          const chapterObj = bookObj[chapterQuery];
          
          if (verseQuery) {
            // Cita exacta (Libro Capítulo:Versículo)
            if (chapterObj[verseQuery]) {
              matchedResults.push({
                book: matchedBook,
                chapter: parseInt(chapterQuery),
                verseNumber: verseQuery,
                text: chapterObj[verseQuery],
                isReferenceMatch: true
              });
            }
          } else {
            // Capítulo entero (Libro Capítulo) - mostrar primeros 5 versículos como vista previa
            Object.keys(chapterObj)
              .filter(k => !isNaN(k))
              .sort((a, b) => parseInt(a) - parseInt(b))
              .slice(0, 10) // Mostrar primeros 10 versículos
              .forEach(vNum => {
                matchedResults.push({
                  book: matchedBook,
                  chapter: parseInt(chapterQuery),
                  verseNumber: vNum,
                  text: chapterObj[vNum],
                  isReferenceMatch: true
                });
              });
          }
        }
      }
    }

    // 2. Si no es una cita directa con capítulo o queremos complementar con búsqueda de texto completo
    // Buscar palabra clave en toda la Biblia
    if (matchedResults.length === 0 || matchedResults.length < 5) {
      let count = 0;
      const maxTextResults = 50; // Limitar para Don Francisco

      for (const book of booksMetadata) {
        const bookObj = bibleData[book.key];
        if (!bookObj) continue;

        for (const chapterKey of Object.keys(bookObj)) {
          if (isNaN(chapterKey)) continue;
          const chapterObj = bookObj[chapterKey];

          for (const verseKey of Object.keys(chapterObj)) {
            if (isNaN(verseKey)) continue;
            const verseText = chapterObj[verseKey];
            const normalizedVerse = normalizeText(verseText);

            if (normalizedVerse.includes(normalizedQuery)) {
              // Evitar duplicar si ya se agregó por cita
              const alreadyAdded = matchedResults.some(
                r => r.book.key === book.key && r.chapter === parseInt(chapterKey) && r.verseNumber === verseKey
              );

              if (!alreadyAdded) {
                matchedResults.push({
                  book: book,
                  chapter: parseInt(chapterKey),
                  verseNumber: verseKey,
                  text: verseText,
                  isReferenceMatch: false
                });

                count++;
                if (count >= maxTextResults) break;
              }
            }
          }
          if (count >= maxTextResults) break;
        }
        if (count >= maxTextResults) break;
      }
    }

    setResults(matchedResults);
  };

  // Función para resaltar el texto buscado en el versículo
  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    
    // Quitar acentos para la comparación pero mantener el texto original para mostrar
    const normalizedText = normalizeText(text);
    const normalizedHighlight = normalizeText(highlight);
    
    const index = normalizedText.indexOf(normalizedHighlight);
    if (index === -1) return text;

    const length = highlight.length;
    
    return (
      <>
        {text.substring(0, index)}
        <mark style={{ backgroundColor: '#fef08a', color: '#1e293b', fontWeight: 600, padding: '0 2px', borderRadius: '4px' }}>
          {text.substring(index, index + length)}
        </mark>
        {text.substring(index + length)}
      </>
    );
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <Search className="search-icon-inside" size={24} />
        <input
          type="text"
          className="search-input"
          placeholder="Busca por palabra (ej. 'fe') o cita (ej. 'Juan 3:16')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {searching && (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
          Buscando en la Biblia Reina Valera...
        </div>
      )}

      {query.trim().length >= 3 && results.length === 0 && !searching && (
        <div className="empty-state">
          No se encontraron resultados para "{query}".<br />
          Intenta con otra palabra o verifica la ortografía.
        </div>
      )}

      {query.trim().length < 3 && (
        <div className="empty-state" style={{ padding: '2rem 1rem' }}>
          <BookOpen size={48} style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Búsqueda instantánea</p>
          <p style={{ fontSize: '0.95rem' }}>Escribe 3 letras o más para comenzar a buscar.</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Resultados encontrados ({results.length}):
          </h4>
          <div className="results-list">
            {results.map((res, idx) => (
              <div
                key={`${res.book.key}_${res.chapter}_${res.verseNumber}_${idx}`}
                className="result-card"
                onClick={() => onSelectVerse(res.book, res.chapter, res.verseNumber)}
              >
                <div className="result-ref">
                  <span>{res.book.name} {res.chapter}:{res.verseNumber}</span>
                  {res.isReferenceMatch && (
                    <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      Cita exacta
                    </span>
                  )}
                </div>
                <p className="result-text">
                  {highlightText(res.text, query)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
