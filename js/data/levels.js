// Level maps. Each map is 40 x 24 tiles (16px each).
//
// Map legend:
//   R roof (solid)        W building wall with windows (solid)
//   . road                , sidewalk               p plaza
//   g grass               f flowers (freed people sniff these)
//   T tree (solid cover)  h hedge (solid cover)    b bench (solid)
//   B billboard (solid)   = crosswalk
//
// NPC and player positions are tile coordinates [x, y].
// `who` names a character from js/data/characters.js. NPCs without one are extras.
// `theme` picks the building style: hustle, aesthetic, scroll, feed.
// `props` are themed decorations (see js/art/props.js). Signs and billboards take
// text: signs ['LOCKED', 'FREED'], billboards ['LOCKED 1', 'LOCKED 2', 'FREED 1', 'FREED 2'].

export const LEVELS = [
  {
    id: 'hustle',
    name: 'The Hustle District',
    feature: 'bro',
    theme: 'hustle',
    ambient: 'flyers',
    intro: {
      title: 'LEVEL 1: THE HUSTLE DISTRICT',
      subtitle: 'NEW: THE GRINDSET BRO',
      body:
        "His line only goes up. Watch the chart above his head.\n\n" +
        'Wait for the MARKET DIP (chart turns red, he freezes), then hit his phone with your slingshot.\n\n' +
        'Hit him while the line is green and he dashes off, and the algorithm gets a grip on you.',
    },
    player: [13, 11],
    npcs: [
      { type: 'bro', at: [5, 7], who: 'chad' },
      { type: 'bro', at: [34, 6], who: 'marcus' },
      { type: 'bro', at: [20, 17], who: 'tyler' },
    ],
    props: [
      { type: 'ticker', at: [2, 4] },
      { type: 'sign', at: [16, 4], text: ['4AM CLUB', 'SLEEP IN CLUB'], color: '#3dff8a' },
      { type: 'gymwin', at: [31, 4] },
      { type: 'bigboard', at: [17, 1], text: ['RISE &', 'GRIND', 'REST &', 'RECOVER'] },
      { type: 'atm', at: [8, 5] },
      { type: 'bull', at: [19, 12] },
      { type: 'plunge', at: [2, 15] },
      { type: 'sign', at: [3, 14], text: ['SHRED SZN', 'SMOOTHIES & NAPS'], color: '#ff8a3d' },
      { type: 'ticker', at: [31, 14] },
      { type: 'sign', at: [16, 21], text: ['CAPITAL', 'COMMUNITY'], color: '#ffd23f' },
      { type: 'atm', at: [31, 18] },
      { type: 'sign', at: [30, 21], text: ['NO DAYS OFF', 'DAY OFF'], color: '#ff3fb4' },
    ],
    map: [
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRR,..,RRRRRRRRRR,..,RRRRRRRRRRR',
      'RRRRRBRRRRR,..,RRRRRRRRRR,..,RRRRRRBRRRR',
      'RRRRRRRRRRR,..,RRRRRRRRRR,..,RRRRRRRRRRR',
      'RWWWWWWWWWW,..,WWWWWWWWWW,..,WWWWWWWWWWR',
      'R,,,T,,,,,,,..,,,,b,,,,,,,..,,,,,,T,,,,R',
      'R......................................R',
      'R......................................R',
      'R,,,,,,,,,,,..,,,,,,,,,,,,..,,,,,,,,,,,R',
      'RRRRRRRRRRR,..,gggggggggg,..,RRRRRRRRRRR',
      'RRRRRRRRRRR,..,gfgTggfTgg,..,RRRRRRRRRRR',
      'RRRRRRRRRRR,..,ggfgbbgfgg,..,RRRRRRRRRRR',
      'RRRRRRRRRRR,..,gTggffggTg,..,RRRRRRRRRRR',
      'RRRRRRRRRRR,..,ggfgggfggg,..,RRRRRRRRRRR',
      'RWWWWWWWWWW,..,gggggggggg,..,WWWWWWWWWWR',
      'R,,,,,,b,,,,..,,,,,,,,,,,,..,,,,b,,,,,,R',
      'R......................................R',
      'R......................................R',
      'R,,,,T,,,,,,..,,,,,,,,,,,,..,,,,,,,T,,,R',
      'RRRRRRRRRRR,..,RRRRRRRRRR,..,RRRRRRRRRRR',
      'RRRRRRRRRRR,..,RRRRBRRRRR,..,RRRRRRRRRRR',
      'RWWWWWWWWWW,..,WWWWWWWWWW,..,WWWWWWWWWWR',
      'R,,,,,,,,,,,..,,,,,,,,,,,,..,,,,,,,,,,,R',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
    ],
  },
  {
    id: 'aesthetic',
    name: 'Aesthetic Avenue',
    feature: 'influencer',
    theme: 'aesthetic',
    ambient: 'sparkles',
    intro: {
      title: 'LEVEL 2: AESTHETIC AVENUE',
      subtitle: 'NEW: THE AESTHETIC INFLUENCER',
      body:
        'She is always filming. Stay out of her camera cone, or you become content (and get stunned).\n\n' +
        'Sneak around and hit her phone from BEHIND. Hits from the front only make her turn to face you.\n\n' +
        'Hedges and trees block her view. The aim marker turns green when a shot will work.',
    },
    player: [2, 8],
    npcs: [
      { type: 'influencer', at: [5, 11], who: 'brooke' },
      { type: 'influencer', at: [34, 11], who: 'jade' },
      { type: 'influencer', at: [20, 5], who: 'sage' },
      { type: 'bro', at: [20, 16] },
    ],
    props: [
      { type: 'sign', at: [3, 3], text: ['LATTE ART', 'OPEN MIC'], color: '#ff7eb6' },
      { type: 'sign', at: [30, 3], text: ['GLOW UP SPA', 'NAP ROOM'], color: '#7ee0ff' },
      { type: 'bigboard', at: [17, 1], text: ['BE YOUR', 'BRAND', 'BE', 'YOURSELF'] },
      { type: 'wings', at: [9, 4] },
      { type: 'wings', at: [26, 4] },
      { type: 'ringlight', at: [8, 12] },
      { type: 'ringlight', at: [31, 12] },
      { type: 'plant', at: [11, 10] },
      { type: 'plant', at: [28, 10] },
      { type: 'decal', at: [13, 6] },
      { type: 'decal', at: [24, 6] },
      { type: 'decal', at: [16, 17] },
      { type: 'decal', at: [29, 19] },
      { type: 'sign', at: [18, 20], text: ['SELFIE SPOT', 'SIT SPOT'], color: '#ff3fb4' },
    ],
    map: [
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRBRRRRRRRRRRRRRRRRRRRRRRRRRBRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWR',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'R,,h,,,h,,,T,,,h,,,,,,,h,,,T,,,h,,,h,,,R',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'R......................................R',
      'R......................................R',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'R,pppppppp,,,hhh,,,,,,,,hhh,,,pppppppp,R',
      'R,pbppppbp,,,gfg,,,,,,,,gfg,,,pbppppbp,R',
      'R,pppTpppp,,,hhh,,,TT,,,hhh,,,ppppTppp,R',
      'R,pppppppp,,,,,,,,,TT,,,,,,,,,pppppppp,R',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'R......................................R',
      'R......................................R',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'R,,h,,,T,,,h,,,,ffff,,,ffff,,,,h,,,T,,,R',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'RWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWR',
      'RRRRRRRRRRRRRRRBRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
    ],
  },
  {
    id: 'scroll',
    name: 'The Scroll',
    feature: 'doom',
    theme: 'scroll',
    ambient: 'rain',
    intro: {
      title: 'LEVEL 3: THE SCROLL',
      subtitle: 'NEW: THE DOOM-SCROLLER',
      body:
        'Their dark aura drains you up close, and your pebbles bounce off it.\n\n' +
        'They fire doom headlines at you. Press ACTION just as one reaches you to DEFLECT it back as good news.\n\n' +
        'Good news stuns them and drops their guard. Then hit the phone!',
    },
    player: [3, 18],
    npcs: [
      { type: 'doom', at: [10, 10], who: 'doug' },
      { type: 'doom', at: [28, 10], who: 'priya' },
      { type: 'doom', at: [19, 14], who: 'ray' },
      { type: 'bro', at: [8, 5] },
      { type: 'influencer', at: [30, 17] },
    ],
    props: [
      { type: 'newsscreen', at: [18, 7] },
      { type: 'newsbox', at: [3, 3] },
      { type: 'newsbox', at: [36, 16] },
      { type: 'lamp', at: [7, 13] },
      { type: 'lamp', at: [32, 13] },
      { type: 'lamp', at: [12, 19] },
      { type: 'lamp', at: [27, 19] },
      { type: 'trash', at: [2, 16] },
      { type: 'trash', at: [21, 19] },
      { type: 'badges', at: [12, 9] },
      { type: 'badges', at: [25, 12] },
      { type: 'sign', at: [2, 2], text: ['DOOM DAILY', 'GOOD NEWS'], color: '#ff3b4e' },
      { type: 'sign', at: [29, 2], text: ['NEWS 24/7', 'NEWS 9-5'], color: '#3fe8ff' },
      { type: 'bigboard', at: [18, 21], text: ['STAY', 'ANXIOUS', 'STAY', 'CURIOUS'] },
    ],
    map: [
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRBRRRRRRRRRRRRBRRRRRRRRRRRRRRRRRRBRRRR',
      'RWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWR',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'R......................................R',
      'R......................................R',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'RRRRRR,pppppppppppppppppppppppppp,RRRRRR',
      'RRRRRR,ppbbppppppppppppppppppbbpp,RRRRRR',
      'RRRRRR,ppppppTppppffffppppTpppppp,RRRRRR',
      'RRRRRR,pppppppppppfggfppppppppppp,RRRRRR',
      'RRRRRR,ppbbpppppppfggfpppppppbbpp,RRRRRR',
      'RRRRRR,pppppppppppffffppppppppppp,RRRRRR',
      'RRRRRR,ppppppTppppppppppppTpppppp,RRRRRR',
      'RRRRRR,ppbbppppppppppppppppppbbpp,RRRRRR',
      'RWWWWW,pppppppppppppppppppppppppp,WWWWWR',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'R......................................R',
      'R......................................R',
      'R,,,T,,,,,,,,,T,,,,,,,,,T,,,,,,,,,T,,,,R',
      'RWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWR',
      'RRRRRRRRRRBRRRRRRRRRRRRRRRRRBRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
    ],
  },
  {
    id: 'feed',
    name: 'The Feed',
    feature: null,
    finale: true,
    theme: 'feed',
    ambient: 'badges',
    intro: {
      title: 'FINALE: THE FEED',
      subtitle: 'EVERYONE IS HERE',
      body:
        'The giant screen in the plaza is the heart of the loop.\n\n' +
        'Bros, influencers and doom-scrollers, all at once. Use everything you have learned.\n\n' +
        'Free every last one of them and see what grows back.',
    },
    player: [3, 17],
    npcs: [
      { type: 'bro', at: [8, 4], who: 'gordon' },
      { type: 'bro', at: [30, 5] },
      { type: 'bro', at: [20, 18] },
      { type: 'influencer', at: [5, 11], who: 'luna' },
      { type: 'influencer', at: [34, 11] },
      { type: 'influencer', at: [12, 16] },
      { type: 'doom', at: [14, 8], who: 'nell' },
      { type: 'doom', at: [25, 8] },
      { type: 'doom', at: [14, 14] },
      { type: 'doom', at: [25, 14] },
    ],
    props: [
      { type: 'eye', at: [16, 10] },
      { type: 'speaker', at: [12, 9] },
      { type: 'speaker', at: [27, 9] },
      { type: 'speaker', at: [12, 13] },
      { type: 'speaker', at: [27, 13] },
      { type: 'ticker', at: [4, 2] },
      { type: 'ticker', at: [32, 2] },
      { type: 'bigboard', at: [17, 0], text: ['THE FEED', 'LOVES YOU', 'LOG OFF', 'LOOK UP'] },
      { type: 'wings', at: [30, 7] },
      { type: 'bull', at: [30, 15] },
      { type: 'newsscreen', at: [6, 15] },
      { type: 'sign', at: [6, 20], text: ['SPONSORED', 'UNSPONSORED'], color: '#ff3fb4' },
      { type: 'sign', at: [26, 20], text: ['TRENDING', 'RESTING'], color: '#3fe8ff' },
    ],
    map: [
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRBRRRRRRRRRRRRRRRRRRRRRRRRRBRRRRRRR',
      'RWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWR',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'R......................................R',
      'R......................................R',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'R,,phpppppppppppppppppppppppppppppphp,,R',
      'R,,ppbbpppTpppppppppppppppppTpppppbbp,,R',
      'R,,pppppppppppffffffffffffppppppppppp,,R',
      'R,,pppppppppppffBBBBBBBBffppppppppppp,,R',
      'R,,pppppppppppffBBBBBBBBffppppppppppp,,R',
      'R,,pppppppppppffBBBBBBBBffppppppppppp,,R',
      'R,,pppppppppppffffffffffffppppppppppp,,R',
      'R,,ppbbpppTpppppppppppppppppTpppppbbp,,R',
      'R,,phpppppppppppppppppppppppppppppphp,,R',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'R......................................R',
      'R......................................R',
      'R,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
      'RWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
    ],
  },
];

export const MAP_W = 40;
export const MAP_H = 24;

// Pads or trims rows so a small typo in a map can't break the game.
export function normalizeMap(rows) {
  const out = [];
  for (let y = 0; y < MAP_H; y++) {
    let row = rows[y] ?? '';
    if (row.length < MAP_W) row = row.slice(0, -1).padEnd(MAP_W - 1, row.slice(-2, -1) || 'R') + 'R';
    if (row.length > MAP_W) row = row.slice(0, MAP_W - 1) + 'R';
    out.push(row);
  }
  return out;
}
