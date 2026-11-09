// Tiny chiptune sound effects made with the Web Audio API. No audio files.
// The audio context is only created after the first tap or key press.

let ctx = null;
let master = null;
let noiseBuf = null;
let muted = false;

function tone(freq, { to = null, dur = 0.1, type = 'square', vol = 0.2, delay = 0 } = {}) {
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.03);
}

function noise({ dur = 0.1, vol = 0.2, delay = 0, hp = 900 } = {}) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

const arp = (notes, step, opts) => notes.forEach((n, i) => tone(n, { ...opts, delay: i * step }));

const SOUNDS = {
  shoot: () => tone(600, { to: 950, dur: 0.06, vol: 0.1 }),
  tink: () => tone(1500, { to: 1100, dur: 0.07, type: 'triangle', vol: 0.15 }),
  thud: () => { noise({ dur: 0.05, vol: 0.12, hp: 400 }); tone(260, { to: 160, dur: 0.08, vol: 0.1 }); },
  dash: () => tone(220, { to: 760, dur: 0.18, type: 'sawtooth', vol: 0.08 }),
  dip: () => tone(760, { to: 190, dur: 0.32, vol: 0.09 }),
  shatter: () => { noise({ dur: 0.28, vol: 0.3, hp: 1800 }); tone(1300, { to: 260, dur: 0.22, type: 'triangle', vol: 0.15 }); },
  freed: () => arp([523, 659, 784, 1047], 0.075, { dur: 0.14, type: 'triangle', vol: 0.18 }),
  parry: () => { tone(880, { to: 1760, dur: 0.08, vol: 0.12 }); tone(1320, { dur: 0.14, type: 'triangle', vol: 0.15, delay: 0.04 }); },
  hurt: () => tone(170, { to: 85, dur: 0.22, type: 'sawtooth', vol: 0.13 }),
  shutter: () => { noise({ dur: 0.03, vol: 0.25, hp: 2500 }); noise({ dur: 0.04, vol: 0.2, hp: 2500, delay: 0.07 }); },
  rec: () => tone(1000, { dur: 0.04, type: 'sine', vol: 0.04 }),
  fire: () => tone(320, { to: 150, dur: 0.14, type: 'sawtooth', vol: 0.06 }),
  stun: () => arp([660, 990, 1320], 0.06, { dur: 0.1, type: 'triangle', vol: 0.13 }),
  onboard: () => tone(420, { to: 70, dur: 0.9, type: 'sawtooth', vol: 0.13 }),
  clear: () => { arp([523, 659, 784], 0.12, { dur: 0.14, vol: 0.12 }); tone(1047, { dur: 0.45, type: 'triangle', vol: 0.18, delay: 0.36 }); },
  bloom: () => arp([392, 523, 659, 784, 1047, 1319], 0.09, { dur: 0.2, type: 'triangle', vol: 0.14 }),
  click: () => tone(440, { dur: 0.04, vol: 0.07 }),
  pop: () => tone(900, { to: 1300, dur: 0.05, type: 'triangle', vol: 0.06 }),
  blip: (p = 1) => tone(520 * p + Math.random() * 40, { dur: 0.035, type: 'square', vol: 0.035 }),
  ping: () => { tone(1320, { dur: 0.08, type: 'sine', vol: 0.08 }); tone(1760, { dur: 0.12, type: 'sine', vol: 0.06, delay: 0.07 }); },
  crash: () => {
    noise({ dur: 0.7, vol: 0.45, hp: 2500 });
    noise({ dur: 0.25, vol: 0.35, hp: 300 });
    for (let i = 0; i < 6; i++) tone(2000 + Math.random() * 2500, { dur: 0.08, type: 'triangle', vol: 0.06, delay: 0.05 + i * 0.07 });
  },
  swoosh: () => noise({ dur: 0.3, vol: 0.12, hp: 1200 }),
  thud2: () => { tone(120, { to: 60, dur: 0.2, type: 'sine', vol: 0.3 }); noise({ dur: 0.08, vol: 0.15, hp: 200 }); },
  chord: () => [392, 494, 587, 784].forEach((n, i) => tone(n, { dur: 1.6, type: 'triangle', vol: 0.07, delay: i * 0.05 })),
};

let rain = null;
function startRain() {
  if (rain || !ctx) return;
  if (!noiseBuf) noise({ dur: 0.01, vol: 0.0001 });
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 1400;
  f.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.value = 0.0001;
  g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 1.5);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start();
  rain = { src, g };
}
function stopRain(fade = 1) {
  if (!rain) return;
  const r = rain;
  rain = null;
  try {
    r.g.gain.setValueAtTime(r.g.gain.value, ctx.currentTime);
    r.g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fade);
    r.src.stop(ctx.currentTime + fade + 0.05);
  } catch (e) {
    /* ignore */
  }
}

export const Sfx = {
  unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.4;
        master.connect(ctx.destination);
      } catch (e) {
        ctx = null;
        return;
      }
    }
    if (ctx.state === 'suspended') ctx.resume();
  },
  play(name, arg) {
    if (muted || !ctx || ctx.state !== 'running') return;
    try {
      SOUNDS[name]?.(arg);
    } catch (e) {
      /* never let audio break the game */
    }
  },
  setMuted(m) {
    muted = m;
    if (m) stopRain(0.1);
  },
  rain(on) {
    if (!ctx || ctx.state !== 'running') return;
    if (on && !muted) startRain();
    else stopRain();
  },
  get muted() {
    return muted;
  },
};
