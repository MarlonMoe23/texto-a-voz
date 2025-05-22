import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [readingIndex, setReadingIndex] = useState(0);
  const utteranceRef = useRef(null);
  const textareaRef = useRef(null);

  // Carga voces y tema oscuro guardado
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      setVoices(allVoices);
      setSelectedVoice((prev) =>
        prev ? allVoices.find((v) => v.name === prev.name) || allVoices[0] : allVoices[0]
      );
    };
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    // Carga tema oscuro desde localStorage
    const savedTheme = localStorage.getItem("tts-dark-theme");
    if (savedTheme) setIsDark(savedTheme === "true");
  }, []);

  // Guardar tema oscuro en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem("tts-dark-theme", isDark.toString());
  }, [isDark]);

  // Función para hablar desde readingIndex
  const speakText = () => {
    if (!text.trim()) {
      alert("Por favor escribe o pega algún texto.");
      return;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    // Ajustamos el texto desde readingIndex
    const textToSpeak = text.slice(readingIndex);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utteranceRef.current = utterance;

    // Cuando termine, reseteamos readingIndex
    utterance.onend = () => {
      setReadingIndex(0);
    };

    speechSynthesis.speak(utterance);
  };

  // Detener la lectura
  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setReadingIndex(0);
  };

  // Cambio tema oscuro/claro
  const toggleTheme = () => setIsDark((v) => !v);

  // Actualizar readingIndex cuando usuario mueve cursor
  const handleCursorChange = (e) => {
    setReadingIndex(e.target.selectionStart);
  };

  // Estilos
  const themeStyles = {
    backgroundColor: isDark ? "#121212" : "#f9f9f9",
    color: isDark ? "#eee" : "#111",
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
    border: `1px solid ${isDark ? "#444" : "#ccc"}`,
    borderRadius: "5px",
    resize: "vertical",
    backgroundColor: isDark ? "#1e1e1e" : "#fff",
    color: isDark ? "#eee" : "#111",
    boxSizing: "border-box",
  };

  const selectStyle = {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    marginBottom: "1rem",
    backgroundColor: isDark ? "#1e1e1e" : "#fff",
    color: isDark ? "#eee" : "#111",
    border: `1px solid ${isDark ? "#444" : "#ccc"}`,
    borderRadius: "5px",
  };

  const iconButton = {
    cursor: "pointer",
    fontSize: "1.5rem",
    padding: "0.4rem 0.8rem",
    marginRight: "0.75rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: isDark ? "#0070f3" : "#0070f3",
    color: "#fff",
    transition: "background-color 0.2s",
  };

  // Responsive para celulares
  const responsiveContainer = {
    padding: "1rem",
  };

  return (
    <div style={themeStyles}>
      <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>
        Texto a Voz (TTS)
      </h1>

      <button
        title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        onClick={toggleTheme}
        style={iconButton}
        aria-label="Cambiar tema"
      >
        {isDark ? "☀️" : "🌙"}
      </button>

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