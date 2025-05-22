import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [readingIndex, setReadingIndex] = useState(0);
  const utteranceRef = useRef(null);
  const textareaRef = useRef(null);

  // Cargar solo voces en español
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      const spanishVoices = allVoices.filter((v) => v.lang.startsWith("es"));
      setVoices(spanishVoices);
      setSelectedVoice((prev) =>
        prev ? spanishVoices.find((v) => v.name === prev.name) || spanishVoices[0] : spanishVoices[0]
      );
    };
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speakText = () => {
    if (!text.trim()) {
      alert("Por favor escribe o pega algún texto.");
      return;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const textToSpeak = text.slice(readingIndex);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utteranceRef.current = utterance;

    utterance.onend = () => {
      setReadingIndex(0);
    };

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setReadingIndex(0);
  };

  const handleCursorChange = (e) => {
    setReadingIndex(e.target.selectionStart);
  };

  const themeStyles = {
    backgroundColor: "#121212",
    color: "#eee",
    minHeight: "100vh",
    padding: "1.5rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    transition: "background-color 0.3s, color 0.3s",
    maxWidth: "600px",
    margin: "auto",
  };

  const textareaStyle = {
    width: "100%",
    height: "150px",
    padding: "1rem",
    fontSize: "1rem",
    border: "1px solid #444",
    borderRadius: "5px",
    resize: "vertical",
    backgroundColor: "#1e1e1e",
    color: "#eee",
    boxSizing: "border-box",
  };

  const selectStyle = {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    marginBottom: "1rem",
    backgroundColor: "#1e1e1e",
    color: "#eee",
    border: "1px solid #444",
    borderRadius: "5px",
  };

  const iconButton = {
    cursor: "pointer",
    fontSize: "1.5rem",
    padding: "0.4rem 0.8rem",
    marginRight: "0.75rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#0070f3",
    color: "#fff",
    transition: "background-color 0.2s",
  };

  return (
    <div style={themeStyles}>
      <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>
        Texto a Voz (TTS)
      </h1>

      <div style={{ margin: "1rem 0" }}>
        <label htmlFor="voiceSelect" style={{ display: "block", marginBottom: "0.4rem" }}>
          Selecciona una voz:
        </label>
        <select
          id="voiceSelect"
          style={selectStyle}
          value={selectedVoice?.name || ""}
          onChange={(e) =>
            setSelectedVoice(voices.find((v) => v.name === e.target.value))
          }
        >
          {voices.map((voice, i) => (
            <option key={i} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      <textarea
        ref={textareaRef}
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onSelect={handleCursorChange}
        onKeyUp={handleCursorChange}
        onClick={handleCursorChange}
        placeholder="Pega aquí tu texto..."
        style={textareaStyle}
        aria-label="Área de texto para pegar texto a leer"
      />

      <p style={{ marginTop: "0.4rem", fontSize: "0.9rem", textAlign: "right" }}>
        Caracteres: {text.length} | Cursor en: {readingIndex}
      </p>

      <div style={{ marginTop: "1rem" }}>
        <button
          title="Leer desde posición actual"
          onClick={speakText}
          style={iconButton}
          aria-label="Leer texto"
        >
          🎧
        </button>
        <button
          title="Detener lectura"
          onClick={stopSpeaking}
          style={{ ...iconButton, backgroundColor: "#e63946" }}
          aria-label="Detener lectura"
        >
          ⏹
        </button>
      </div>
    </div>
  );
}
