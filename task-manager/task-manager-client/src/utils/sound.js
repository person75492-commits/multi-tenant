// Generates short tones using the Web Audio API — no audio files needed

const ctx = () => new (window.AudioContext || window.webkitAudioContext)();

const play = (freq, duration, type = 'sine', vol = 0.3) => {
  try {
    const ac  = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch {
    // Audio not supported — fail silently
  }
};

export const sounds = {
  success: () => { play(520, 0.12); setTimeout(() => play(660, 0.15), 100); },
  error:   () => { play(220, 0.2, 'sawtooth', 0.2); },
  notify:  () => { play(440, 0.1); setTimeout(() => play(550, 0.1), 120); },
  delete:  () => { play(300, 0.15, 'triangle'); },
};
