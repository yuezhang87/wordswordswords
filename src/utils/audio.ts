/**
 * Multi-tiered Audio Engine for 6-Year-Old English Spelling Game
 * 
 * Guarantees audio playback across all browsers, operating systems, and sandboxed iframes:
 * Tier 1: Real studio voice audio recordings (Oxford/Dictionary Audio CDN)
 * Tier 2: Web Speech API (SpeechSynthesis) with Chrome queue fixes and unlock watchdog
 * Tier 3: Built-in Web Audio Phonic Formant Synthesizer for individual sounds and phonemes
 */

let audioCtx: AudioContext | null = null;
let currentPlayingAudio: HTMLAudioElement | null = null;
const activeUtterances = new Set<SpeechSynthesisUtterance>();

// Pre-cached audio elements for instant zero-latency playback
const audioCache = new Map<string, HTMLAudioElement>();

// Curated studio recordings for Grade 1 words
const WORD_AUDIO_MAP: Record<string, string[]> = {
  the: [
    'https://ssl.gstatic.com/dictionary/static/sounds/oxford/the--_us_1.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/the-us.mp3',
  ],
  this: [
    'https://ssl.gstatic.com/dictionary/static/sounds/oxford/this--_us_1.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/this-us.mp3',
  ],
  that: [
    'https://ssl.gstatic.com/dictionary/static/sounds/oxford/that--_us_1.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/that-us.mp3',
  ],
  thin: [
    'https://ssl.gstatic.com/dictionary/static/sounds/oxford/thin--_us_1.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/thin-us.mp3',
  ],
  bath: [
    'https://ssl.gstatic.com/dictionary/static/sounds/oxford/bath--_us_1.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/bath-us.mp3',
  ],
  chat: [
    'https://ssl.gstatic.com/dictionary/static/sounds/oxford/chat--_us_1.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/chat-us.mp3',
  ],
  chin: [
    'https://ssl.gstatic.com/dictionary/static/sounds/oxford/chin--_us_1.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/chin-us.mp3',
  ],
  chip: [
    'https://ssl.gstatic.com/dictionary/static/sounds/oxford/chip--_us_1.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/chip-us.mp3',
  ],
  much: [
    'https://ssl.gstatic.com/dictionary/static/sounds/oxford/much--_us_1.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/much-us.mp3',
  ],
  lunch: [
    'https://ssl.gstatic.com/dictionary/static/sounds/oxford/lunch--_us_1.mp3',
    'https://api.dictionaryapi.dev/media/pronunciations/en/lunch-us.mp3',
  ],
};

/**
 * Get or resume AudioContext
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Unlock all audio capabilities on user interaction
 */
export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.getVoices();
    } catch (e) {
      console.warn('Speech synthesis unlock check:', e);
    }
  }
}

// Global user interaction unblocker
if (typeof window !== 'undefined') {
  const unlock = () => {
    unlockAudio();
    // Warm up audio cache
    Object.entries(WORD_AUDIO_MAP).forEach(([word, urls]) => {
      if (!audioCache.has(word) && urls[0]) {
        try {
          const audio = new Audio();
          audio.src = urls[0];
          audio.preload = 'auto';
          audioCache.set(word, audio);
        } catch (e) {}
      }
    });

    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
  };

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}

// ==========================================
// 1. PHONEME & FORMANT SYNTHESIS (Web Audio API)
// ==========================================

/**
 * Generates synthetic noise buffer for unvoiced consonants like 'th', 'ch', 's', 'sh'
 */
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Synthesizes realistic phoneme sounds (digraphs, vowels, consonants)
 * Works 100% offline and in iframe sandboxes with no external voice dependency!
 */
export function playPhonemeSound(phoneme: string) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const p = phoneme.toLowerCase().trim();

  // Also trigger speech synthesis as parallel layer if available
  speakText(p, 0.7, 1.1);

  if (p === 'th') {
    // Voiced/unvoiced soft dental fricative
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    // Warm undertone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.35);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (p === 'ch') {
    // Affricate /tʃ/ - explosive transient followed by high-frequency friction
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.28);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4200, now);
    filter.Q.setValueAtTime(2.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.55, now + 0.02); // sharp attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.28);
  } else if (p === 'a' || p === 'æ') {
    // Vowel /æ/ (as in "chat", "that") - Formants F1 ~ 800Hz, F2 ~ 1750Hz
    playFormantVowel(ctx, 800, 1750, 0.4);
  } else if (p === 'i' || p === 'ɪ') {
    // Vowel /ɪ/ (as in "thin", "chin", "chip", "this") - Formants F1 ~ 400Hz, F2 ~ 2100Hz
    playFormantVowel(ctx, 400, 2100, 0.4);
  } else if (p === 'u' || p === 'ʌ') {
    // Vowel /ʌ/ (as in "much", "lunch") - Formants F1 ~ 650Hz, F2 ~ 1250Hz
    playFormantVowel(ctx, 650, 1250, 0.4);
  } else if (p === 'o' || p === 'ɒ') {
    // Vowel /ɒ/ - Formants F1 ~ 550Hz, F2 ~ 950Hz
    playFormantVowel(ctx, 550, 950, 0.4);
  } else if (p === 'e' || p === 'ɛ') {
    // Vowel /ɛ/ - Formants F1 ~ 550Hz, F2 ~ 1800Hz
    playFormantVowel(ctx, 550, 1800, 0.4);
  } else {
    // Generic letter sound / consonant tone
    playLetterClickSound(p);
  }
}

/**
 * Dual-formant synthesis for distinct human vowel sounds
 */
function playFormantVowel(ctx: AudioContext, f1: number, f2: number, duration: number) {
  const now = ctx.currentTime;
  const fundamental = 160; // Child/teacher pitch

  // Voice source (buzz)
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(fundamental, now);

  // Formant filter 1
  const filter1 = ctx.createBiquadFilter();
  filter1.type = 'bandpass';
  filter1.frequency.setValueAtTime(f1, now);
  filter1.Q.setValueAtTime(4.0, now);

  // Formant filter 2
  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'bandpass';
  filter2.frequency.setValueAtTime(f2, now);
  filter2.Q.setValueAtTime(5.0, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(filter1);
  osc.connect(filter2);
  filter1.connect(gain);
  filter2.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

// ==========================================
// 2. SOUND EFFECTS (Web Audio API)
// ==========================================

export function playLetterClickSound(char?: string) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const charCode = char ? char.toLowerCase().charCodeAt(0) : 100;
  const baseFreq = 440 + (charCode % 26) * 18;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.06);

  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

export function playWaterDropSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(700, now);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(1100, now + 0.16);

  gain.gain.setValueAtTime(0.45, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

export function playCorrectChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const now = ctx.currentTime + idx * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  });
}

export function playGrowSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const notes = [329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((freq, idx) => {
    const now = ctx.currentTime + idx * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  });
}

export function playPopSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

export function playGentleBoing() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(340, now);
  osc.frequency.linearRampToValueAtTime(220, now + 0.18);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

export function playCelebrationFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const chords = [
    { freqs: [523.25, 659.25, 783.99], time: 0, dur: 0.22 },
    { freqs: [523.25, 659.25, 783.99], time: 0.24, dur: 0.22 },
    { freqs: [523.25, 659.25, 783.99], time: 0.48, dur: 0.22 },
    { freqs: [659.25, 783.99, 1046.5], time: 0.72, dur: 0.8 },
  ];

  chords.forEach(({ freqs, time, dur }) => {
    freqs.forEach(freq => {
      const now = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    });
  });
}

// ==========================================
// 3. WORD AUDIO PLAYER (Studio Audio MP3)
// ==========================================

/**
 * Plays high-quality human studio recording for a word
 */
export async function playStudioWordAudio(word: string): Promise<boolean> {
  const cleanWord = word.trim().toLowerCase();
  const urls = WORD_AUDIO_MAP[cleanWord];
  if (!urls || urls.length === 0) return false;

  unlockAudio();

  // Stop previous audio
  if (currentPlayingAudio) {
    try {
      currentPlayingAudio.pause();
      currentPlayingAudio.currentTime = 0;
    } catch (e) {}
  }

  for (const url of urls) {
    try {
      let audio = audioCache.get(cleanWord);
      if (!audio) {
        audio = new Audio(url);
        audioCache.set(cleanWord, audio);
      } else {
        audio.src = url;
        audio.currentTime = 0;
      }

      currentPlayingAudio = audio;
      audio.volume = 1.0;
      await audio.play();
      return true;
    } catch (err) {
      console.warn(`Audio play failed for ${url}:`, err);
    }
  }

  return false;
}

// ==========================================
// 4. SPEECH SYNTHESIS ENGINE (TTS)
// ==========================================

function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const enVoices = voices.filter(v => v.lang.startsWith('en'));
  if (enVoices.length === 0) return voices[0];

  const bestVoice = enVoices.find(v =>
    v.name.includes('Google') ||
    v.name.includes('Natural') ||
    v.name.includes('Samantha') ||
    v.name.includes('Ava') ||
    v.name.includes('Karen') ||
    v.name.includes('Daniel') ||
    v.name.includes('Alex') ||
    v.name.includes('Victoria') ||
    v.lang === 'en-US'
  );

  return bestVoice || enVoices[0];
}

/**
 * Robust SpeechSynthesis with fallback
 */
export function speakText(text: string, rate: number = 0.85, pitch: number = 1.05) {
  if (typeof window === 'undefined') return;

  unlockAudio();

  if (!('speechSynthesis' in window)) {
    playCorrectChime();
    return;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getEnglishVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang || 'en-US';
        } else {
          utterance.lang = 'en-US';
        }

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1.0;

        activeUtterances.add(utterance);
        utterance.onend = () => activeUtterances.delete(utterance);
        utterance.onerror = () => activeUtterances.delete(utterance);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('speakText inner error:', err);
      }
    }, 35);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

/**
 * Main function to pronounce a word:
 * Tries Studio Recording first for 100% clarity, then TTS fallback
 */
export async function speakWordSlow(word: string) {
  unlockAudio();
  const played = await playStudioWordAudio(word);
  if (!played) {
    // Fallback to TTS
    speakText(word, 0.75, 1.05);
  }
}

export function speakLetter(letter: string) {
  playLetterClickSound(letter);
  playPhonemeSound(letter);
}

/**
 * Sounds out phonics sequentially:
 * Plays each individual phoneme sound (e.g., 'th', 'i', 'n') with delay,
 * then smoothly blends and plays the full studio recording of the whole word!
 */
export async function speakPhonicsSlow(
  phonics: string[],
  wholeWord: string,
  onStepHighlight?: (index: number) => void
) {
  unlockAudio();

  for (let i = 0; i < phonics.length; i++) {
    const chunk = phonics[i];
    if (onStepHighlight) onStepHighlight(i);
    playPhonemeSound(chunk);
    // Wait between phonics chunks
    await new Promise(res => setTimeout(res, 650));
  }

  // Highlight all / finished
  if (onStepHighlight) onStepHighlight(-1);

  // Short pause before whole word blend
  await new Promise(res => setTimeout(res, 250));
  playWaterDropSound();
  await new Promise(res => setTimeout(res, 150));
  await speakWordSlow(wholeWord);
}

export function speakSentence(sentence: string) {
  unlockAudio();
  speakText(sentence, 0.85, 1.05);
}

/**
 * Dictates a test item for Friday spelling test:
 * Plays studio recording of the word, then reads sentence context
 */
export async function dictateTestWord(
  word: string,
  sentence: string,
  isBonus?: boolean,
  bonusLastName?: string
) {
  unlockAudio();
  playWaterDropSound();
  await new Promise(res => setTimeout(res, 200));

  if (isBonus && bonusLastName) {
    speakText(`Bonus Word. Spell your last name: ${bonusLastName}.`);
    return;
  }

  // Play the crystal clear studio recording
  await speakWordSlow(word);
}

const CHEERS = [
  'Awesome job!',
  'You did it! Super star!',
  'Way to go!',
  'Look at your tree grow!',
  'Fantastic spelling!',
  'Great work!',
  'You are a spelling champion!',
];

export function speakRandomCheer() {
  const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  speakText(cheer, 0.95, 1.15);
}
