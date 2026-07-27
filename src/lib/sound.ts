// Tiny WebAudio scratch sound — no asset needed.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function playScratch() {
  const ac = getCtx();
  if (!ac) return;
  const dur = 0.18;
  const buffer = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
  const data = buffer.getChannelData(0);
  // filtered pink-ish noise with a quick fade
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = 0.94 * last + 0.06 * white;
    const t = i / data.length;
    const env = Math.sin(Math.PI * t) * (1 - t * 0.4);
    data[i] = last * env * 0.6;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const g = ac.createGain();
  g.gain.value = 0.35;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.9;
  src.connect(bp).connect(g).connect(ac.destination);
  src.start();
}
