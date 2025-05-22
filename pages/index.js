import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');

  const speakText = () => {
    if (!text.trim()) {
      alert('Por favor escribe o pega algún texto.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Texto a Voz (TTS)</h1>

      <textarea
        rows="8"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pega aquí tu texto..."
        style={{
          width: '100%',
          padding: '1rem',
          fontSize: '1rem',
          border: '1px solid #ccc',
          borderRadius: '5px',
          resize: 'vertical'
        }}
      />

      <br /><br />

      <button
        onClick={speakText}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Leer en voz alta
      </button>
    </div>
  );
}
