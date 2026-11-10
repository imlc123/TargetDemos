import { Save } from './Save.js';

// The player's hero: name, gender (look + pronouns), skin tone and cap color.

export const PRONOUNS = {
  boy: { they: 'he', them: 'him', their: 'his', theyre: "he's" },
  girl: { they: 'she', them: 'her', their: 'her', theyre: "she's" },
  nb: { they: 'they', them: 'them', their: 'their', theyre: "they're" },
};

export const RANDOM_NAMES = [
  'Robin', 'Sky', 'Kit', 'Jules', 'Rowan', 'Max', 'Ash', 'Remy', 'Nova', 'Sam', 'Quinn', 'Indy',
  'Lou', 'Milo', 'Ada', 'Zoe', 'Leo', 'Ivy', 'Pip', 'Juno', 'Ezra', 'Wren', 'Theo', 'Lark',
];

export const DEFAULT_HERO = { name: 'Kit', gender: 'nb', skin: 0, cap: 0 };

export function randomName(current = '') {
  let n = current;
  while (n === current) n = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  return n;
}

// Keeps names short and simple (the pixel font only has basic letters).
export function cleanName(raw) {
  return String(raw || '')
    .replace(/[^A-Za-z0-9 '\-.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10);
}

export const Hero = {
  get() {
    return Save.load().hero || DEFAULT_HERO;
  },
  exists() {
    return !!Save.load().hero;
  },
  set(profile) {
    Save.setHero({ ...profile, name: cleanName(profile.name) || randomName() });
  },
  // Replaces {name}, {they}, {them}, {their}, {theyre} (and capitalized versions).
  fill(text) {
    const h = this.get();
    const p = PRONOUNS[h.gender] || PRONOUNS.nb;
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    return String(text).replace(/\{(name|they|them|their|theyre|They|Them|Their|Theyre)\}/g, (_, k) => {
      if (k === 'name') return h.name;
      const v = p[k.toLowerCase()];
      return k[0] === k[0].toUpperCase() ? cap(v) : v;
    });
  },
};
