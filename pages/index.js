import { useEffect, useState, useRef } from "react";
import { Play, Pause, Square, RotateCcw, Volume2, Moon, Sun, Download, Upload, Settings, Headphones } from "lucide-react";

export default function TTSPro() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [readingIndex, setReadingIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [highlightedText, setHighlightedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  
  const utteranceRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);

  // Load voices and theme
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      const sortedVoices = allVoices.sort((a, b) => a.name.localeCompare(b.name));
      setVoices(sortedVoices);
      
      // Prefer neural/premium voices
      const preferredVoice = sortedVoices.find(v => 
        v.name.includes('Neural') || 
        v.name.includes('Premium') || 
        v.name.includes('Enhanced') ||
        v.localService
      ) || sortedVoices[0];
      
      setSelectedVoice(preferredVoice);
    };
    
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // Calculate stats when text changes
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Estimate reading time (average 150 words per minute, adjusted by rate)
    const wpm = 150 * rate;
    const minutes = words.length / wpm;
    setEstimatedTime(minutes);
  }, [text, rate]);

  // Advanced speak function with word highlighting
  const speakText = () => {
    if (!text.trim()) {
      alert("Por favor ingresa algún texto para leer.");
      return;
    }
    
    if (speechSynthesis.speaking && !isPaused) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    const textToSpeak = text.slice(readingIndex);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utteranceRef.current = utterance;

    // Word highlighting simulation
    const words = textToSpeak.split(' ');
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      if (currentIndex < words.length && isPlaying) {
        setCurrentWordIndex(currentIndex);
        setReadingProgress((currentIndex / words.length) * 100);
        currentIndex++;
      }
    }, (60 / (150 * rate)) * 1000); // Approximate timing

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setReadingIndex(0);
      setCurrentWordIndex(0);
      setReadingProgress(0);
      clearInterval(intervalRef.current);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      clearInterval(intervalRef.current);
    };

    speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setReadingIndex(0);
    setCurrentWordIndex(0);
    setReadingProgress(0);
    clearInterval(intervalRef.current);
  };

  const resetToBeginning = () => {
    stopSpeaking();
    setReadingIndex(0);
    if (textareaRef.current) {
      textareaRef.current.selectionStart = 0;
      textareaRef.current.selectionEnd = 0;
      textareaRef.current.focus();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const downloadText = () => {
    if (!text.trim()) return;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'texto-tts.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCursorChange = (e) => {
    setReadingIndex(e.target.selectionStart);
  };

  const formatTime = (minutes) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    return `${Math.floor(minutes)}m ${Math.round((minutes % 1) * 60)}s`;
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`p-3 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-600'} shadow-lg`}>
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${
              isDark 
                ? 'from-blue-400 to-cyan-400' 
                : 'from-blue-600 to-cyan-600'
            } bg-clip-text text-transparent`}>
              TextVoice Pro
            </h1>
          </div>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Convierte cualquier texto en audio con tecnología avanzada
          </p>
        </div>

        {/* Main Card */}
        <div className={`backdrop-blur-lg rounded-3xl shadow-2xl border p-8 ${
          isDark 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/80 border-white/40'
        }`}>
          
          {/* Controls Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-3 rounded-full transition-all hover:scale-110 ${
                  isDark 
                    ? 'bg-yellow-500 hover:bg-yellow-400' 
                    : 'bg-slate-700 hover:bg-slate-600'
                } shadow-lg`}
              >
                {isDark ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-3 rounded-full transition-all hover:scale-110 ${
                  isDark ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'
                } shadow-lg`}
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-full transition-all hover:scale-110 ${
                  isDark ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600 hover:bg-green-500'
                } shadow-lg`}
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={downloadText}
                disabled={!text.trim()}
                className={`p-3 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-500'
                } shadow-lg`}
              >
                <Download className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className={`mb-6 p-6 rounded-2xl border transition-all ${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-gray-50/80 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Configuración de Audio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Velocidad: {rate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Tono: {pitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Volumen: {Math.round(volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Voz del Sistema
                </label>
                <select
                  value={selectedVoice?.name || ""}
                  onChange={(e) => setSelectedVoice(voices.find(v => v.name === e.target.value))}
                  className={`w-full p-3 rounded-xl border transition-all ${
                    isDark 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  {voices.map((voice, i) => (
                    <option key={i} value={voice.name} className={isDark ? 'bg-slate-800' : 'bg-white'}>
                      {voice.name} ({voice.lang}) {voice.localService ? '🔸' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Text Area */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Texto a convertir
              </label>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="inline-flex items-center gap-4">
                  <span>📝 {wordCount} palabras</span>
                  <span>⏱️ ~{formatTime(estimatedTime)}</span>
                  <span>📍 Cursor: {readingIndex}</span>
                </span>
              </div>
            </div>
            
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onSelect={handleCursorChange}
              onKeyUp={handleCursorChange}
              onClick={handleCursorChange}
              placeholder="Escribe o pega aquí tu texto para convertir a audio..."
              className={`w-full h-64 p-4 rounded-2xl border transition-all resize-none focus:ring-4 ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-purple-500/30' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-500/30'
              } focus:outline-none focus:border-transparent shadow-inner`}
            />
          </div>

          {/* Progress Bar */}
          {isPlaying && (
            <div className="mb-6">
              <div className={`flex justify-between text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Progreso de lectura</span>
                <span>{Math.round(readingProgress)}%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                isDark ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                <div 
                  className={`h-full transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={speakText}
              disabled={!text.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                isPlaying && !isPaused
                  ? (isDark ? 'bg-red-600 hover:bg-red-500' : 'bg-red-600 hover:bg-red-500')
                  : (isDark ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600 hover:bg-green-500')
              } text-white`}
            >
              {isPlaying && !isPaused ? (
                <>
                  <Square className="w-5 h-5" />
                  Detener
                </>
              ) : isPaused ? (
                <>
                  <Play className="w-5 h-5" />
                  Continuar
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Reproducir
                </>
              )}
            </button>

            {(isPlaying || isPaused) && (
              <button
                onClick={pauseSpeaking}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg ${
                  isDark ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-yellow-600 hover:bg-yellow-500'
                } text-white`}
              >
                <Pause className="w-5 h-5" />
                Pausar
              </button>
            )}

            <button
              onClick={resetToBeginning}
              disabled={readingIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                isDark ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'
              } text-white`}
            >
              <RotateCcw className="w-5 h-5" />
              Reiniciar
            </button>
          </div>

          {/* Status */}
          {isPlaying && (
            <div className={`mt-6 p-4 rounded-2xl text-center ${
              isDark 
                ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30' 
                : 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200'
            }`}>
              <div className={`flex items-center justify-center gap-2 ${isDark ? 'text-purple-300' : 'text-blue-700'}`}>
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span className="font-medium">Reproduciendo audio...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`text-center mt-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-sm">
            Usa las teclas de flecha y selecciona texto para cambiar la posición de inicio
          </p>
        </div>
      </div>
    </div>
  );
}