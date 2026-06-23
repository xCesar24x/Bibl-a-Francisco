import React, { useState, useEffect, useRef } from 'react';
import bibleData from '../data/bible.json';
import { booksMetadata } from '../data/booksMetadata';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  BookmarkCheck, 
  FileText, 
  Copy,
  Check
} from 'lucide-react';

export default function BibleReader({ 
  book, 
  chapter, 
  onNavigate, 
  favorites, 
  onToggleFavorite, 
  notes, 
  onSaveNote,
  globalFontSize = 20,
  globalVoiceRate = 0.92,
}) {
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noteText, setNoteText] = useState('');

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const voicesRef = useRef([]); // Cache de voces disponibles

  // Pre-cargar voces en cuanto el componente monta
  // getVoices() es asíncrono en Chrome/Safari — hay que esperar onvoiceschanged
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        voicesRef.current = available;
      }
    };

    // Intento inmediato (funciona en Firefox)
    loadVoices();

    // Suscripción al evento para Chrome/Edge/Safari
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Seleccionar la mejor voz en español disponible
  const getBestSpanishVoice = () => {
    const voices = voicesRef.current.length > 0
      ? voicesRef.current
      : window.speechSynthesis.getVoices(); // fallback por si acaso

    const es = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith('es'));
    if (es.length === 0) return null;

    return (
      es.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural')) ||
      es.find(v => v.name.toLowerCase().includes('google')) ||
      es.find(v => v.name.toLowerCase().includes('paulina') || v.name.toLowerCase().includes('sabina') || v.name.toLowerCase().includes('helena') || v.name.toLowerCase().includes('mónica')) ||
      es.find(v => v.lang.toLowerCase().includes('mx')) ||
      es.find(v => v.lang.toLowerCase().includes('es-es')) ||
      es[0]
    );
  };

  const bookObj = bibleData[book.key];
  const chapterObj = bookObj ? bookObj[chapter.toString()] : null;
  
  // Detener voz si cambia el capítulo
  useEffect(() => {
    stopAudio();
    setSelectedVerse(null);
    setIsDrawerOpen(false);
  }, [book.key, chapter]);

  if (!chapterObj) {
    return <div className="empty-state">No se encontró este capítulo.</div>;
  }

  // Obtener versículos ordenados numéricamente
  const verses = Object.keys(chapterObj)
    .filter(k => !isNaN(k))
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(vNum => ({
      number: vNum,
      text: chapterObj[vNum]
    }));

  const handleVerseClick = (verse) => {
    setSelectedVerse(verse);
    setNoteText(notes[`${book.key}_${chapter}_${verse.number}`] || '');
    setIsDrawerOpen(true);
    setCopied(false);
  };

  const handleToggleFav = () => {
    onToggleFavorite(book, chapter, selectedVerse);
  };

  const isFavorite = selectedVerse && favorites.some(
    fav => fav.bookKey === book.key && fav.chapter === chapter && fav.verseNumber === selectedVerse.number
  );

  const handleSaveNote = () => {
    onSaveNote(book.key, chapter, selectedVerse.number, noteText);
    setIsDrawerOpen(false);
  };

  const handleCopy = () => {
    const textToCopy = `"${selectedVerse.text.trim()}" — ${book.name} ${chapter}:${selectedVerse.number} (Reina Valera 1960)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text-To-Speech (Voz alta) — con carga correcta de voces
  const speakText = (textToSpeak) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    synth.cancel();

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'es-MX';
      utterance.rate = globalVoiceRate;
      utterance.pitch = 1.0;

      const bestVoice = getBestSpanishVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (e) => {
        console.warn('TTS error:', e.error);
        setIsPlaying(false);
      };

      utteranceRef.current = utterance;
      setIsPlaying(true);
      synth.speak(utterance);
    };

    // Si las voces ya están cargadas, hablar de inmediato
    // Si no, esperar a que se carguen (Chrome/Safari necesitan esto)
    if (voicesRef.current.length > 0) {
      doSpeak();
    } else {
      const waitAndSpeak = () => {
        const loaded = synth.getVoices();
        if (loaded.length > 0) {
          voicesRef.current = loaded;
        }
        doSpeak();
        synth.onvoiceschanged = null;
      };
      synth.onvoiceschanged = waitAndSpeak;
      // Timeout de seguridad: hablar aunque no haya voces premium
      setTimeout(() => {
        if (!isPlaying) doSpeak();
      }, 600);
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handlePlayChapter = () => {
    const fullText = verses.map(v => `${v.number}. ${v.text}`).join(' ');
    speakText(`${book.name}, capítulo ${chapter}. ${fullText}`);
  };

  const handlePlayVerse = () => {
    speakText(`${book.name} ${chapter} versículo ${selectedVerse.number}. ${selectedVerse.text}`);
  };

  // Navegar al capítulo anterior o siguiente
  const handlePrevChapter = () => {
    // Buscar el índice del libro actual
    const currentBookIndex = booksMetadata.findIndex(b => b.key === book.key);
    
    if (chapter > 1) {
      onNavigate(book, chapter - 1);
    } else if (currentBookIndex > 0) {
      // Ir al último capítulo del libro anterior
      const prevBook = booksMetadata[currentBookIndex - 1];
      const prevBookObj = bibleData[prevBook.key];
      const lastChapter = Object.keys(prevBookObj).filter(k => !isNaN(k)).length;
      onNavigate(prevBook, lastChapter);
    }
  };

  const handleNextChapter = () => {
    const currentBookIndex = booksMetadata.findIndex(b => b.key === book.key);
    const totalChapters = Object.keys(bibleData[book.key]).filter(k => !isNaN(k)).length;

    if (chapter < totalChapters) {
      onNavigate(book, chapter + 1);
    } else if (currentBookIndex < booksMetadata.length - 1) {
      // Ir al primer capítulo del siguiente libro
      const nextBook = booksMetadata[currentBookIndex + 1];
      onNavigate(nextBook, 1);
    }
  };

  return (
    <div className="reader-container">
      {/* Encabezado del Lector */}
      <div className="reader-header">
        <div className="reader-navigation-row">
          <button className="btn-icon" onClick={handlePrevChapter} title="Capítulo Anterior">
            <ChevronLeft size={30} />
          </button>
          
          <div className="reader-current-ref">
            {book.name} {chapter}
          </div>

          <button className="btn-icon" onClick={handleNextChapter} title="Siguiente Capítulo">
            <ChevronRight size={30} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        {/* Controles de Voz */}
          <button 
            className="btn-secondary" 
            onClick={handlePlayChapter} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px', padding: '0.4rem 1rem' }}
          >
            {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span>{isPlaying ? 'Detener voz' : 'Escuchar capítulo'}</span>
          </button>
        </div>
      </div>

      {/* Cuerpo del Texto */}
      <div 
        className="text-container" 
        style={{ fontSize: `${globalFontSize}px`, lineHeight: 1.8 }}
      >
        {verses.map((verse) => (
          <span 
            key={verse.number}
            className={`verse-block ${selectedVerse?.number === verse.number ? 'selected' : ''}`}
            onClick={() => handleVerseClick(verse)}
          >
            <span className="verse-number">{verse.number}</span>
            {verse.text}
          </span>
        ))}
      </div>

      {/* Navegación Inferior Rápida */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '2rem' }}>
        <button className="btn-secondary" onClick={handlePrevChapter} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ChevronLeft size={20} />
          Anterior
        </button>
        <button className="btn-secondary" onClick={handleNextChapter} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Siguiente
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Cajón de opciones del versículo seleccionado (Drawer) */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
        {selectedVerse && (
          <>
            <div className="drawer-header">
              <div className="drawer-title" style={{ color: 'var(--accent-color)' }}>
                {book.name} {chapter}:{selectedVerse.number}
              </div>
              <button className="btn-secondary" onClick={() => setIsDrawerOpen(false)} style={{ padding: '0.3rem 0.8rem' }}>
                Cerrar
              </button>
            </div>

            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text-main)', borderLeft: '4px solid var(--border-color)', paddingLeft: '0.75rem' }}>
              {selectedVerse.text}
            </p>

            {/* Acciones Rápidas */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button 
                className="btn-primary" 
                onClick={handleToggleFav}
                style={{ flex: 1, backgroundColor: isFavorite ? '#ef4444' : 'var(--accent-color)' }}
              >
                {isFavorite ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                <span>{isFavorite ? 'Quitar Favorito' : 'Guardar Favorito'}</span>
              </button>
              
              <button className="btn-secondary" onClick={handlePlayVerse} title="Escuchar este versículo">
                <Volume2 size={20} />
              </button>

              <button className="btn-secondary" onClick={handleCopy} title="Copiar versículo">
                {copied ? <Check size={20} style={{ color: 'green' }} /> : <Copy size={20} />}
              </button>
            </div>

            {/* Notas Rápidas */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <FileText size={16} />
                Nota para la iglesia (ej. anotación del sermón):
              </label>
              <textarea 
                className="verse-note-area"
                placeholder="Escribe aquí tu nota sobre este versículo..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button className="btn-primary" onClick={handleSaveNote} style={{ width: '100%' }}>
                Guardar Nota
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
