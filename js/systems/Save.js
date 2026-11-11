// Progress saved in the browser. Every access is wrapped so the game
// still works when storage is blocked (private mode, embedded previews).

const KEY = 'targetdemos.v1';
const LEVEL_COUNT = 6;
// Saves from before Reply Row and Podcast Pier had 4 levels: hustle, aesthetic, scroll, feed.
const OLD_TO_NEW = [0, 1, 3, 5];
let cache = null;

function defaults() {
  return { version: 2, unlocked: 1, cleared: Array(LEVEL_COUNT).fill(false), muted: false, hero: null, seenIntro: false };
}

export const Save = {
  load() {
    if (cache) return cache;
    cache = defaults();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.version === 2) {
          if (typeof d.unlocked === 'number') cache.unlocked = Math.max(1, Math.min(LEVEL_COUNT, d.unlocked));
          if (Array.isArray(d.cleared)) cache.cleared = cache.cleared.map((_, i) => !!d.cleared[i]);
        } else {
          // move old progress to the new level numbers; the new levels open in order
          if (Array.isArray(d.cleared)) d.cleared.forEach((c, i) => { if (c && OLD_TO_NEW[i] !== undefined) cache.cleared[OLD_TO_NEW[i]] = true; });
          let firstOpen = cache.cleared.findIndex((c) => !c);
          if (firstOpen < 0) firstOpen = LEVEL_COUNT - 1;
          const oldUnlocked = typeof d.unlocked === 'number' ? Math.max(1, Math.min(4, d.unlocked)) : 1;
          cache.unlocked = Math.max(1, Math.min(OLD_TO_NEW[oldUnlocked - 1] + 1, firstOpen + 1));
        }
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
    d.unlocked = Math.max(d.unlocked, Math.min(LEVEL_COUNT, index + 2));
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
