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

export const LEVELS = [
  {
    id: 'hustle',
    name: 'The Hustle District',
    feature: 'bro',
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
      { type: 'bro', at: [5, 7] },
      { type: 'bro', at: [34, 6] },
      { type: 'bro', at: [20, 17] },
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
      { type: 'influencer', at: [5, 11] },
      { type: 'influencer', at: [34, 11] },
      { type: 'influencer', at: [20, 5] },
      { type: 'bro', at: [20, 16] },
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
      { type: 'doom', at: [10, 10] },
      { type: 'doom', at: [28, 10] },
      { type: 'doom', at: [19, 14] },
      { type: 'bro', at: [8, 5] },
      { type: 'influencer', at: [30, 17] },
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
      { type: 'bro', at: [8, 4] },
      { type: 'bro', at: [30, 5] },
      { type: 'bro', at: [20, 18] },
      { type: 'influencer', at: [5, 11] },
      { type: 'influencer', at: [34, 11] },
      { type: 'influencer', at: [12, 16] },
      { type: 'doom', at: [14, 8] },
      { type: 'doom', at: [25, 8] },
      { type: 'doom', at: [14, 14] },
      { type: 'doom', at: [25, 14] },
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
