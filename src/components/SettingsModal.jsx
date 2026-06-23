import React from 'react';
import { Sun, Moon, BookHeart, Type, Mic2, Heart, Wifi, X } from 'lucide-react';

/**
 * SettingsModal — Panel de Ajustes Premium para Biblia Francisco
 * Props:
 *   isOpen       : boolean
 *   onClose      : () => void
 *   theme        : 'light' | 'sepia' | 'dark'
 *   onTheme      : (theme) => void
 *   fontSize     : number  (16-36)
 *   onFontSize   : (size) => void
 *   voiceRate    : number  (0.5-1.3)
 *   onVoiceRate  : (rate) => void
 */
export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onTheme,
  fontSize,
  onFontSize,
  voiceRate,
  onVoiceRate,
}) {
  if (!isOpen) return null;

  const themes = [
    {
      id: 'light',
      label: 'Claro',
      icon: <Sun size={20} />,
      preview: {
        bg: 'linear-gradient(135deg, #e8eaf8, #dde4f5)',
        card: 'rgba(255,255,255,0.9)',
        text: '#1e1b4b',
        accent: '#4f46e5',
      },
    },
    {
      id: 'sepia',
      label: 'Cálido',
      icon: <span style={{ fontSize: '1.1rem' }}>☀️</span>,
      preview: {
        bg: 'linear-gradient(135deg, #f5ead0, #ede4c4)',
        card: 'rgba(245,236,203,0.95)',
        text: '#3d3000',
        accent: '#b58900',
      },
    },
    {
      id: 'dark',
      label: 'Iglesia',
      icon: <Moon size={20} />,
      preview: {
        bg: 'linear-gradient(135deg, #06091a, #0d1330)',
        card: 'rgba(30,41,59,0.9)',
        text: '#f0f4ff',
        accent: '#818cf8',
      },
    },
  ];

  const fontSizeLabel = fontSize <= 18 ? 'Pequeño' : fontSize <= 22 ? 'Normal' : fontSize <= 28 ? 'Grande' : 'Muy Grande';
  const voiceLabel = voiceRate <= 0.65 ? 'Muy Lento' : voiceRate <= 0.85 ? 'Lento' : voiceRate <= 1.0 ? 'Normal' : 'Rápido';

  return (
    <>
      {/* Overlay */}
      <div
        className="drawer-overlay open"
        onClick={onClose}
        style={{ zIndex: 200 }}
      />

      {/* Panel */}
      <div
        className="drawer open"
        style={{
          zIndex: 201,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '28px 28px 0 0',
        }}
      >
        {/* ── Cabecera ─────────────────────────────────── */}
        <div className="drawer-header" style={{ marginBottom: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚙️</span>
            <span className="drawer-title">Ajustes</span>
          </div>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Cerrar ajustes"
            style={{ borderRadius: '50%', padding: '0.5rem' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '0.5rem' }}>

          {/* ── 1. Tema Visual ───────────────────────────── */}
          <section>
            <SectionLabel icon={<Sun size={16} />} text="Tema Visual" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {themes.map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onTheme(t.id)}
                    style={{
                      border: active
                        ? `2.5px solid ${t.preview.accent}`
                        : '2px solid transparent',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      boxShadow: active
                        ? `0 0 0 3px ${t.preview.accent}33, 0 4px 12px rgba(0,0,0,0.12)`
                        : '0 2px 8px rgba(0,0,0,0.08)',
                      transform: active ? 'scale(1.04)' : 'scale(1)',
                      transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    }}
                    aria-pressed={active}
                    aria-label={`Tema ${t.label}`}
                  >
                    {/* Mini-preview del tema */}
                    <div
                      style={{
                        background: t.preview.bg,
                        height: '64px',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      <div
                        style={{
                          background: t.preview.card,
                          borderRadius: '6px',
                          height: '14px',
                          width: '80%',
                        }}
                      />
                      <div
                        style={{
                          background: t.preview.card,
                          borderRadius: '4px',
                          height: '8px',
                          width: '60%',
                          opacity: 0.75,
                        }}
                      />
                      <div
                        style={{
                          background: t.preview.accent,
                          borderRadius: '4px',
                          height: '8px',
                          width: '40%',
                          marginTop: 'auto',
                        }}
                      />
                    </div>
                    {/* Etiqueta */}
                    <div
                      style={{
                        background: t.preview.card,
                        color: t.preview.text,
                        padding: '6px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {t.icon}
                      {t.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 2. Tamaño de Letra ───────────────────────── */}
          <section>
            <SectionLabel icon={<Type size={16} />} text="Tamaño de Letra" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Botón − */}
              <button
                className="btn-icon"
                onClick={() => onFontSize(Math.max(16, fontSize - 2))}
                disabled={fontSize <= 16}
                style={{ flexShrink: 0, fontSize: '1.4rem', fontWeight: 700, width: '44px', height: '44px' }}
                aria-label="Reducir texto"
              >
                A
              </button>

              {/* Slider */}
              <div style={{ flex: 1 }}>
                <input
                  type="range"
                  min={16}
                  max={36}
                  step={2}
                  value={fontSize}
                  onChange={(e) => onFontSize(parseInt(e.target.value))}
                  className="settings-slider"
                  aria-label="Tamaño de letra"
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                  }}
                >
                  <span>A</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
                    {fontSizeLabel} ({fontSize}px)
                  </span>
                  <span style={{ fontSize: '1.1rem' }}>A</span>
                </div>
              </div>

              {/* Botón + */}
              <button
                className="btn-icon"
                onClick={() => onFontSize(Math.min(36, fontSize + 2))}
                disabled={fontSize >= 36}
                style={{ flexShrink: 0, fontSize: '1.8rem', fontWeight: 700, width: '44px', height: '44px' }}
                aria-label="Aumentar texto"
              >
                A
              </button>
            </div>

            {/* Preview en vivo */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                marginTop: '0.75rem',
                fontFamily: 'var(--font-serif)',
                fontSize: `${fontSize}px`,
                lineHeight: 1.6,
                color: 'var(--text-main)',
                transition: 'font-size 0.2s ease',
              }}
            >
              "Jehová es mi pastor; nada me faltará."
            </div>
          </section>

          {/* ── 3. Velocidad de la Voz ───────────────────── */}
          <section>
            <SectionLabel icon={<Mic2 size={16} />} text="Velocidad de la Voz" />
            <div style={{ padding: '0 0.25rem' }}>
              <input
                type="range"
                min={0.5}
                max={1.3}
                step={0.05}
                value={voiceRate}
                onChange={(e) => onVoiceRate(parseFloat(e.target.value))}
                className="settings-slider"
                aria-label="Velocidad de la voz"
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                }}
              >
                <span>🐢 Lento</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
                  {voiceLabel}
                </span>
                <span>🐇 Rápido</span>
              </div>
            </div>

            {/* Botón de prueba de voz */}
            <button
              className="btn-secondary"
              style={{ width: '100%', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance('Esta es la velocidad de lectura seleccionada.');
                u.lang = 'es-MX';
                u.rate = voiceRate;
                const voices = window.speechSynthesis.getVoices();
                const esVoice = voices.find(v => v.lang.startsWith('es'));
                if (esVoice) u.voice = esVoice;
                window.speechSynthesis.speak(u);
              }}
            >
              <Mic2 size={16} />
              Probar voz
            </button>
          </section>

          {/* ── 4. Acerca de ─────────────────────────────── */}
          <section>
            <div
              style={{
                background: 'linear-gradient(135deg, var(--accent-color) 0%, #6366f1 100%)',
                borderRadius: '20px',
                padding: '1.25rem',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✝️</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem', fontFamily: 'var(--font-sans)' }}>
                Biblia Francisco
              </div>
              <div style={{ fontSize: '0.82rem', opacity: 0.88, lineHeight: 1.6, fontFamily: 'var(--font-sans)' }}>
                Diseñada con amor para Don Francisco 🙏<br />
                Reina Valera 1960 • Completa: 66 libros<br />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', background: 'rgba(255,255,255,0.18)', borderRadius: '20px', padding: '2px 10px' }}>
                  <Wifi size={12} style={{ transform: 'rotate(45deg)', opacity: 0.7 }} />
                  Funciona 100% sin internet
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                marginTop: '1rem',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
              }}
            >
              <Heart size={12} style={{ fill: '#f43f5e', stroke: '#f43f5e' }} />
              Hecho con cariño por tu familia
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

/** Subtítulo de sección */
function SectionLabel({ icon, text }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 700,
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        marginBottom: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {icon}
      {text}
    </div>
  );
}
