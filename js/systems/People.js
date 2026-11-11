import { CHARACTERS, EXTRA_NAMES, extraLook } from '../data/characters.js';
import { buildCharacter } from '../art/sprites.js';
import { buildPortrait } from '../art/portraits.js';

const seedOf = (id) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);

// Builds sprite sheets and portraits for all named characters.
export function buildNamedCharacters(scene) {
  for (const [id, c] of Object.entries(CHARACTERS)) {
    const look = { ...c.look, kind: c.kind };
    buildCharacter(scene, `ch_${id}`, look);
    buildPortrait(scene, `pt_${id}`, look, c.kind, seedOf(id), `gen:portraits/${id}`);
  }
}

// Returns the person for one NPC slot in a level.
export function personFor(scene, levelIndex, level, npcDef, slot) {
  const kind = npcDef.type;
  if (npcDef.who && CHARACTERS[npcDef.who]) {
    const id = npcDef.who;
    const c = CHARACTERS[id];
    return { id, name: c.name, kind, convo: c, tex: `ch_${id}`, portrait: `pt_${id}` };
  }
  // An extra person: their own look and name, reusing a conversation of the same kind.
  const seed = levelIndex * 31 + slot * 7 + 3;
  const look = { ...extraLook(kind, seed), kind };
  const id = `x_${levelIndex}_${slot}`;
  buildCharacter(scene, `ch_${id}`, look);
  buildPortrait(scene, `pt_${id}`, look, kind, seed);
  const sameKind = Object.values(CHARACTERS).filter((c) => c.kind === kind);
  const here = level.npcs.map((n) => n.who).filter(Boolean).map((w) => CHARACTERS[w]).filter((c) => c && c.kind === kind);
  const pool = here.length ? here : sameKind;
  return {
    id, name: EXTRA_NAMES[seed % EXTRA_NAMES.length], kind,
    convo: pool[seed % pool.length], tex: `ch_${id}`, portrait: `pt_${id}`,
  };
}
