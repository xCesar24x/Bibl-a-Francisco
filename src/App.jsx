import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Bookmark, Settings, BookOpenCheck, Award } from 'lucide-react';
import BibleSelector from './components/BibleSelector';
import BibleReader from './components/BibleReader';
import BibleSearch from './components/BibleSearch';
import FavoritesList from './components/FavoritesList';
import SettingsModal from './components/SettingsModal';
import portadaImg from './assets/portada.jpg';

// Una lista de versículos hermosos para mostrar como "Versículo del Día"
const keyVerses = [
  { bookKey: 'Salmos', bookName: 'Salmos', chapter: 23, verseNumber: '1', text: 'Jehová es mi pastor; nada me faltará.' },
  { bookKey: 'S.Juan', bookName: 'Juan', chapter: 3, verseNumber: '16', text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.' },
  { bookKey: 'Filipenses', bookName: 'Filipenses', chapter: 4, verseNumber: '13', text: 'Todo lo puedo en Cristo que me fortalece.' },
  { bookKey: 'Josué', bookName: 'Josué', chapter: 1, verseNumber: '9', text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.' },
  { bookKey: 'Romanos', bookName: 'Romanos', chapter: 8, verseNumber: '28', text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.' },
  { bookKey: 'Isaías', bookName: 'Isaías', chapter: 41, verseNumber: '10', text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.' },
  { bookKey: 'Proverbios', bookName: 'Proverbios', chapter: 3, verseNumber: '5', text: 'Fíate de Jehová de todo tu corazón, Y no te apoyes en tu propia prudencia.' },
  { bookKey: 'Mateo', bookKeyInJson: 'S. Mateo', bookName: 'Mateo', chapter: 6, verseNumber: '33', text: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('selector');
  const [theme, setTheme] = useState('light');
  const [currentBook, setCurrentBook] = useState({ name: 'Génesis', key: 'Génesis', testament: 'Antiguo' });
  const [currentChapter, setCurrentChapter] = useState(1);
  const [fontSize, setFontSize] = useState(20);
  const [voiceRate, setVoiceRate] = useState(0.92);

  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState({});
  const [history, setHistory] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [verseOfDay, setVerseOfDay] = useState(keyVerses[0]);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('bible-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedFontSize = localStorage.getItem('bible-fontsize');
    if (savedFontSize) setFontSize(parseInt(savedFontSize));

    const savedVoiceRate = localStorage.getItem('bible-voicerate');
    if (savedVoiceRate) setVoiceRate(parseFloat(savedVoiceRate));

    const savedFavs = localStorage.getItem('bible-favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedNotes = localStorage.getItem('bible-notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));

    const savedHistory = localStorage.getItem('bible-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedCurrent = localStorage.getItem('bible-current-read');
    if (savedCurrent) {
      const { book, chapter } = JSON.parse(savedCurrent);
      setCurrentBook(book);
      setCurrentChapter(chapter);
    }

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setVerseOfDay(keyVerses[dayOfYear % keyVerses.length]);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('bible-theme', newTheme);
  };

  const handleFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('bible-fontsize', size.toString());
  };

  const handleVoiceRate = (rate) => {
    setVoiceRate(rate);
    localStorage.setItem('bible-voicerate', rate.toString());
  };

  // Guardar/Quitar favoritos
  const toggleFavorite = (book, chapter, verse) => {
    let updated;
    const isFav = favorites.some(
      f => f.bookKey === book.key && f.chapter === chapter && f.verseNumber === verse.number
    );

    if (isFav) {
      updated = favorites.filter(
        f => !(f.bookKey === book.key && f.chapter === chapter && f.verseNumber === verse.number)
      );
    } else {
      updated = [
        ...favorites,
        {
          bookKey: book.key,
          bookName: book.name,
          book: book,
          chapter: chapter,
          verseNumber: verse.number,
          text: verse.text
        }
      ];
    }
    setFavorites(updated);
    localStorage.setItem('bible-favorites', JSON.stringify(updated));
  };

  const removeFavorite = (fav) => {
    const updated = favorites.filter(
      f => !(f.bookKey === fav.bookKey && f.chapter === fav.chapter && f.verseNumber === fav.verseNumber)
    );
    setFavorites(updated);
    localStorage.setItem('bible-favorites', JSON.stringify(updated));
  };

  // Guardar nota de versículo
  const saveNote = (bookKey, chapter, verseNumber, noteText) => {
    const key = `${bookKey}_${chapter}_${verseNumber}`;
    const updated = { ...notes, [key]: noteText };
    // Si la nota está vacía, eliminar la clave
    if (!noteText.trim()) {
      delete updated[key];
    }
    setNotes(updated);
    localStorage.setItem('bible-notes', JSON.stringify(updated));
  };

  // Añadir al historial de lectura
  const addToHistory = (book, chapter) => {
    // Evitar duplicados seguidos
    const cleaned = history.filter(h => !(h.book.key === book.key && h.chapter === chapter));
    const updated = [
      { book, chapter, timestamp: new Date().getTime() },
      ...cleaned
    ].slice(0, 20); // Guardar últimas 20 lecturas

    setHistory(updated);
    localStorage.setItem('bible-history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('bible-history');
  };

  // Al seleccionar un capítulo desde el menú
  const handleSelectChapter = (book, chapter) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    addToHistory(book, chapter);
    localStorage.setItem('bible-current-read', JSON.stringify({ book, chapter }));
    setActiveTab('reader');
  };

  // Al seleccionar un versículo desde búsqueda/favoritos
  const handleSelectVerse = (book, chapter, verseNumber) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    addToHistory(book, chapter);
    localStorage.setItem('bible-current-read', JSON.stringify({ book, chapter }));
    setActiveTab('reader');

    // Retrasar ligeramente para dar tiempo a que cargue el lector y hacer scroll
    setTimeout(() => {
      if (verseNumber) {
        const elements = document.getElementsByClassName('verse-block');
        for (let el of elements) {
          const vNumSpan = el.querySelector('.verse-number');
          if (vNumSpan && vNumSpan.textContent === verseNumber.toString()) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.click(); // Abrir el drawer de notas/favoritos automáticamente
            break;
          }
        }
      }
    }, 200);
  };

  return (
    <div className="app-container">
      {/* Encabezado */}
      <header>
        <div className="header-title" onClick={() => setActiveTab('selector')} style={{ cursor: 'pointer' }}>
          <BookOpenCheck size={28} style={{ strokeWidth: 2.5 }} />
          <span>Biblia Francisco</span>
        </div>
        <div className="header-actions">
          <button 
            className="btn-icon" 
            onClick={() => setIsSettingsOpen(true)}
            title="Ajustes de Lectura"
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="main-content">
        {/* Banner "Versículo del Día" en la pestaña de inicio/selector */}
        {activeTab === 'selector' && (
          <div 
            className="result-card" 
            style={{ 
              background: `linear-gradient(135deg, rgba(79, 70, 229, 0.85), rgba(17, 24, 39, 0.9)), url(${portadaImg})`, 
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#ffffff',
              border: 'none',
              marginBottom: '1.5rem',
              borderRadius: '24px',
              padding: '1.5rem',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.15)'
            }}
            onClick={() => {
              const bookMeta = {
                name: verseOfDay.bookName,
                key: verseOfDay.bookKey,
                testament: verseOfDay.chapter > 40 ? 'Nuevo' : 'Antiguo' // Simplificación
              };
              handleSelectVerse(bookMeta, verseOfDay.chapter, verseOfDay.verseNumber);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem', opacity: 0.9, fontWeight: 600 }}>
              <Award size={18} />
              <span>VERSÍCULO DEL DÍA</span>
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '0.75rem', fontWeight: 300 }}>
              "{verseOfDay.text}"
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', fontWeight: 600 }}>
              <span>{verseOfDay.bookName} {verseOfDay.chapter}:{verseOfDay.verseNumber}</span>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Leer ahora →</span>
            </div>
          </div>
        )}

        {/* Vistas según pestaña activa */}
        {activeTab === 'selector' && (
          <BibleSelector onSelectChapter={handleSelectChapter} />
        )}

        {activeTab === 'reader' && (
          <BibleReader
            book={currentBook}
            chapter={currentChapter}
            onNavigate={handleSelectChapter}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            notes={notes}
            onSaveNote={saveNote}
            globalFontSize={fontSize}
            globalVoiceRate={voiceRate}
          />
        )}

        {activeTab === 'search' && (
          <BibleSearch onSelectVerse={handleSelectVerse} />
        )}

        {activeTab === 'favorites' && (
          <FavoritesList
            favorites={favorites}
            onRemoveFavorite={removeFavorite}
            history={history}
            onClearHistory={clearHistory}
            onSelectVerse={handleSelectVerse}
            notes={notes}
          />
        )}
      </main>

      {/* Barra de Navegación Inferior (Grande y fácil de tocar) */}
      <nav className="nav-bar">
        <button 
          className={`nav-item ${activeTab === 'selector' ? 'active' : ''}`}
          onClick={() => setActiveTab('selector')}
        >
          <BookOpen size={24} />
          <span>Libros</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'reader' ? 'active' : ''}`}
          onClick={() => setActiveTab('reader')}
        >
          <BookOpenCheck size={24} />
          <span>Lector</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <Search size={24} />
          <span>Buscar</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <Bookmark size={24} />
          <span>Guardados</span>
        </button>
      </nav>

      {/* Modal de Ajustes Premium */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onTheme={handleThemeChange}
        fontSize={fontSize}
        onFontSize={handleFontSize}
        voiceRate={voiceRate}
        onVoiceRate={handleVoiceRate}
      />
    </div>
  );
}
