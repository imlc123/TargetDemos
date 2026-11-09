// Progress saved in the browser. Every access is wrapped so the game
// still works when storage is blocked (private mode, embedded previews).

const KEY = 'targetdemos.v1';
let cache = null;

function defaults() {
  return { unlocked: 1, cleared: [false, false, false, false], muted: false, hero: null, seenIntro: false };
}

export const Save = {
  load() {
    if (cache) return cache;
    cache = defaults();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.unlocked === 'number') cache.unlocked = Math.max(1, Math.min(4, d.unlocked));
        if (Array.isArray(d.cleared)) cache.cleared = cache.cleared.map((_, i) => !!d.cleared[i]);
        cache.muted = !!d.muted;
        cache.seenIntro = !!d.seenIntro;
        if (d.hero && typeof d.hero.name === 'string') {
          cache.hero = {
            name: d.hero.name.slice(0, 10),
            gender: ['boy', 'girl', 'nb'].includes(d.hero.gender) ? d.hero.gender : 'nb',
            skin: Math.max(0, Math.min(3, d.hero.skin | 0)),
            cap: Math.max(0, Math.min(3, d.hero.cap | 0)),
          };
        }
      }
    } catch (e) {
      /* storage unavailable: keep defaults */
    }
    return cache;
  },
  write() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(cache));
    } catch (e) {
      /* ignore */
    }
  },
  clearLevel(index) {
    const d = this.load();
    d.cleared[index] = true;
    d.unlocked = Math.max(d.unlocked, Math.min(4, index + 2));
    this.write();
  },
  setMuted(m) {
    this.load().muted = m;
    this.write();
  },
  setHero(hero) {
    this.load().hero = hero;
    this.write();
  },
  setSeenIntro() {
    this.load().seenIntro = true;
    this.write();
  },
};
