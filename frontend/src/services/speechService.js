// Browser Web Speech API Service (STT + TTS)
// Fully client-side, zero backend / zero API keys required

/**
 * Checks if Speech Recognition is supported in the current browser
 */
export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && Boolean(
    window.SpeechRecognition || 
    window.webkitSpeechRecognition
  );
}

/**
 * Checks if SpeechSynthesis is supported
 */
export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Starts a SpeechRecognition session
 * 
 * @param {Object} options
 * @param {Function} options.onResult - ({ transcript, isFinal }) => void
 * @param {Function} options.onEnd - () => void
 * @param {Function} options.onError - (error) => void
 * @param {string} options.language - 'ur-PK' or 'en-US'
 */
export function startVoiceRecognition({ onResult, onEnd, onError, language = 'en-US' }) {
  if (!isSpeechRecognitionSupported()) {
    onError?.('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
    return null;
  }

  // Barge-in: immediately stop any ongoing speech synthesis when user starts to speak!
  stopSpeaking();

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = language;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    // Barge-in check: ensure TTS remains stopped
    stopSpeaking();

    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const res = event.results[i];
      if (res.isFinal) {
        finalTranscript += res[0].transcript;
      } else {
        interimTranscript += res[0].transcript;
      }
    }

    onResult?.({
      transcript: finalTranscript || interimTranscript,
      isFinal: Boolean(finalTranscript)
    });
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    onError?.(event.error);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    console.error('Failed to start speech recognition:', err);
    onError?.(err.message);
    return null;
  }
}

/**
 * Speaks aloud text using browser SpeechSynthesis (TTS)
 * 
 * @param {string} text
 * @param {Object} options
 * @param {Function} options.onStart
 * @param {Function} options.onEnd
 * @param {boolean} options.isMuted
 * @param {string} options.language - 'ur-PK' or 'en-US'
 */
export function speakText(text, { onStart, onEnd, isMuted = false, language = 'en-US' } = {}) {
  if (!isSpeechSynthesisSupported() || isMuted || !text) {
    onEnd?.();
    return;
  }

  // Cancel any prior utterance
  stopSpeaking();

  // Strip emojis, symbols, and formatting for clean pronunciation
  const cleanText = text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[*_#`•\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to pick the best voice for Urdu or English/Roman Urdu
  const voices = window.speechSynthesis.getVoices();
  const isUrduScript = /[\u0600-\u06FF]/.test(cleanText);

  let selectedVoice = null;
  if (isUrduScript) {
    selectedVoice = voices.find(v => v.lang.includes('ur') || v.lang.includes('ar'));
  }

  if (!selectedVoice) {
    // English / Indian English / Natural Voice works best for Roman Urdu
    selectedVoice = voices.find(v => 
      v.lang.includes('en-IN') || 
      v.name.includes('Natural') || 
      v.name.includes('Google UK English Female') || 
      v.lang.includes('en-GB') || 
      v.lang.includes('en')
    );
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => {
    console.warn('TTS utterance note:', e);
    onEnd?.();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis speak error:', err);
    onEnd?.();
  }
}

/**
 * Stops any active speech synthesis immediately (Barge-in helper)
 */
export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }
}
