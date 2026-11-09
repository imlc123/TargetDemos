// The people you free. Three named characters per level; extra NPCs reuse one
// of these conversations under a different name.
//
// Each line is [face, text]. face: 'n' neutral, 'h' happy.
// You can use these tokens in any line: {name} {they} {them} {their} {theyre}
// and capitalized {They} {Their} {Theyre}. They become the player's name and pronouns.
//
// Conversation order: lines -> reply choice -> that reply's answer -> hint.
// Talking to someone again shows one of their follow-up lines.
//
// look: skin, hair (color), hairStyle (short, buzz, swoop, long, bob, bun, curly, pony, messy),
//       hat (cap, capBack, hood, beanie) + hatColor, top, bottom, shoes, eyes,
//       extras (chain, earbuds, hoops, shades, glasses, eyebags, stubble, freckles, headphones)

export const CHARACTERS = {
  // ---------------- Level 1: The Hustle District ----------------
  chad: {
    name: 'Chad', kind: 'bro',
    look: { skin: '#f0c4a0', hair: '#6b4426', hairStyle: 'buzz', hat: 'capBack', hatColor: '#27408b', top: '#1fbfa5', bottom: '#4a4a5a', shoes: '#f4f4f4', eyes: '#3a6a9a', extras: ['chain', 'stubble'] },
    lines: [
      ['n', "Whoa. Where's my phone? I had, like, eleven trades open."],
      ['n', "I haven't slept since a stock went up on Tuesday. Which Tuesday? Great question."],
      ['h', "But wait... my heart is doing a normal speed. Is this what resting feels like?"],
    ],
    choice: [
      { label: 'You look tired.', reply: [['h', "TIRED! That's the word! I'm gonna lie on that bench and be so tired."]] },
      { label: 'Want to go outside?', reply: [['h', 'We ARE outside. Have we always been outside? This is wild, {name}.']] },
    ],
    hint: ['n', "Heads up: the next street is all ring lights. Don't stand in front of a camera. Sneak around back."],
    followup: [
      ['h', 'I watched a cloud for ten minutes. Zero returns. Loved it.'],
      ['n', 'Do you know any good naps? Asking for me.'],
    ],
  },
  marcus: {
    name: 'Marcus', kind: 'bro',
    look: { skin: '#8d5a3b', hair: '#1a1210', hairStyle: 'swoop', top: '#ff8a3d', bottom: '#3a3a48', shoes: '#ffd23f', eyes: '#3a2a1a', extras: ['glasses'] },
    lines: [
      ['n', "I used to sell a course called 'Sleep Is For The Poor.'"],
      ['n', 'Forty modules. Every one was just me yelling in a parked car.'],
      ['h', 'Someone just told me about naps. You lie down... on purpose... in the DAY?'],
    ],
    choice: [
      { label: 'Naps are great.', reply: [['h', "I'm gonna take three. Back to back. A nap stack."]] },
      { label: 'Your videos were loud.', reply: [['n', '...They were SO loud. Sorry, everyone.'], ['h', "I'll use my inside voice now. Inside AND outside."]] },
    ],
    hint: ['n', 'Influencers film in a cone in front of them. Trees and hedges block the shot. Use them.'],
    followup: [
      ['h', 'Day one of my new routine: no routine.'],
      ['h', "I deleted the word 'optimize.' My brain feels roomy."],
    ],
  },
  tyler: {
    name: 'Tyler', kind: 'bro',
    look: { skin: '#5a3826', hair: '#120c0a', hairStyle: 'short', hat: 'capBack', hatColor: '#c0392b', top: '#3a3a4a', bottom: '#6a6a7a', shoes: '#ffffff', eyes: '#2a1a12', extras: ['earbuds'] },
    lines: [
      ['n', "Bro. BRO. I can hear birds. They don't even have a playlist."],
      ['n', 'I used to play bass in a band. Then I started tracking my macros instead of my music.'],
      ['h', 'My fingers still remember the chords. My protein shake does not remember me.'],
    ],
    choice: [
      { label: 'Get the band back!', reply: [['h', "We're getting the band back together. We're called... The Rest Days."]] },
      { label: "What's a macro?", reply: [['h', "Exactly! Who cares! I'm eating a whole peach and not writing it down."]] },
    ],
    hint: ['n', 'See the chart over a Bro\'s head? Wait for it to turn red. That\'s the dip. They freeze up.'],
    followup: [
      ['h', "Writing a song about {name}. {Theyre} gonna love it."],
      ['h', 'Rest days are just... days. I get it now.'],
    ],
  },

  // ---------------- Level 2: Aesthetic Avenue ----------------
  brooke: {
    name: 'Brooke', kind: 'influencer',
    look: { skin: '#f6d1b0', hair: '#f3d36b', hairStyle: 'long', top: '#ff7eb6', bottom: '#a98bff', shoes: '#5a3a5a', eyes: '#3a8a9a', extras: ['hoops', 'shades', 'freckles'] },
    lines: [
      ['n', 'Wait, where is my ring light? Where is my... face filter?'],
      ['h', 'Oh! That is just my face. Huh! It has freckles!'],
      ['n', 'I filmed four hundred sunsets and never actually watched one.'],
    ],
    choice: [
      { label: 'Watch the next one?', reply: [['h', 'With my EYES? Okay. Sunset date with myself. No posting.']] },
      { label: 'Freckles look good.', reply: [['h', 'Thanks! They were free. Nothing on my face was free before.']] },
    ],
    hint: ['n', 'Down in The Scroll, people throw doom headlines. Swat one back right as it reaches you.'],
    followup: [
      ['h', "I'm keeping this moment. Inside my head. Wild."],
      ['h', 'I described a sandwich to a friend instead of posting it. Ten out of ten.'],
    ],
  },
  jade: {
    name: 'Jade', kind: 'influencer',
    look: { skin: '#e8b48f', hair: '#16121a', hairStyle: 'bob', top: '#7ee0ff', bottom: '#ffb36b', shoes: '#ffffff', eyes: '#3a2a1a', extras: ['hoops'] },
    lines: [
      ['n', 'I own four hundred shirts. Most still have the tags on.'],
      ['n', "Every haul video ended with 'link in bio.' My whole bio was links."],
      ['h', "I'm throwing a shirt swap. Free shirts! For people! In person!"],
    ],
    choice: [
      { label: 'Can I have a shirt?', reply: [['h', 'YES. Take a shirt. Take nine. Be a shirt person, {name}.']] },
      { label: 'Sounds fun.', reply: [['h', 'It will be SO fun. No sponsors. Just snacks.']] },
    ],
    hint: ['n', "Doom-Scrollers have a dark aura that bounces pebbles. Stun them first, then aim for the phone."],
    followup: [
      ['h', 'Shirt swap is Saturday. Bring a neighbor.'],
      ['h', 'I wore the same outfit twice. Nobody died.'],
    ],
  },
  sage: {
    name: 'Sage', kind: 'influencer',
    look: { skin: '#a8714c', hair: '#2a1a14', hairStyle: 'bun', top: '#c9b0ff', bottom: '#e8d8b0', shoes: '#8a6a4a', eyes: '#4a6a3a', extras: [] },
    lines: [
      ['n', "I sold 'manifestation crystals.' Eighty-eight dollars each."],
      ['h', 'Honestly? I just really like rocks.'],
      ['n', "Rocks don't need engagement. They just sit there, being rocks."],
    ],
    choice: [
      { label: 'Rocks are cool.', reply: [['h', 'Rocks are SO cool. This one looks like a potato. Priceless.']] },
      { label: '$88 is a lot.', reply: [['n', "It was a lot. I'm giving refunds."], ['h', 'And also rocks. Everyone gets a rock.']] },
    ],
    hint: ['n', 'If the Algorithm meter gets high, step back and breathe. It drains when nothing is hitting you.'],
    followup: [
      ['h', 'Found a rock shaped like a heart. Not selling it.'],
      ['h', 'Wellness tip: go outside. Free of charge.'],
    ],
  },

  // ---------------- Level 3: The Scroll ----------------
  doug: {
    name: 'Doug', kind: 'doom',
    look: { skin: '#e8c4a8', hair: '#8a7a6a', hairStyle: 'messy', top: '#6a7a4a', bottom: '#4a4a5a', shoes: '#3a3a3a', eyes: '#5a5a3a', extras: ['glasses', 'eyebags'] },
    lines: [
      ['n', 'I refreshed the news every thirty seconds. For six years.'],
      ['n', 'Every headline said the world was ending. It never quite finished ending.'],
      ['h', 'But this pigeon? This pigeon is having a fantastic day.'],
    ],
    choice: [
      { label: 'Pigeons are news too.', reply: [['h', 'LOCAL PIGEON THRIVING. Best headline I have read in years.']] },
      { label: 'You can stay informed.', reply: [['n', 'Right. Read the news once. Then go live in the world.'], ['h', 'Like a... person.']] },
    ],
    hint: ['n', 'The Feed is downtown. Biggest screen you have ever seen. Everyone ends up there.'],
    followup: [
      ['h', 'Breaking: I ate breakfast. Sitting down.'],
      ['h', 'The pigeon and I are friends now. His name is Kevin.'],
    ],
  },
  priya: {
    name: 'Priya', kind: 'doom',
    look: { skin: '#9a6440', hair: '#1a1010', hairStyle: 'long', top: '#7a4ab8', bottom: '#3a3a4a', shoes: '#e8e8e8', eyes: '#3a2010', extras: ['headphones'] },
    lines: [
      ['n', 'I have argued with ten thousand strangers in comment sections.'],
      ['n', 'I won zero arguments. Some of them were bots. One was a fridge.'],
      ['h', "I just said 'nice dog' to a real man with a real dog. He said thanks!"],
    ],
    choice: [
      { label: "'Nice dog' is a great comment.", reply: [['h', 'Five stars. Would comment again. In real life.']] },
      { label: 'A fridge??', reply: [['n', 'A smart fridge. It had very strong opinions about milk.']] },
    ],
    hint: ['n', 'At The Feed the meter fills fast. Free the doom-scrollers early so their auras stop draining you.'],
    followup: [
      ['h', 'I complimented three hats today. Undefeated.'],
      ['h', 'Reply guy? More like walk guy. I walk now.'],
    ],
  },
  ray: {
    name: 'Ray', kind: 'doom',
    look: { skin: '#4a2e20', hair: '#0e0a08', hairStyle: 'short', hat: 'hood', hatColor: '#2a3a6a', top: '#2a3a6a', bottom: '#3a3a3a', shoes: '#c0392b', eyes: '#2a1a10', extras: ['eyebags'] },
    lines: [
      ['n', "I haven't seen a sunrise since I started reading angry posts at 3 a.m."],
      ['n', "Every night: 'one more thread.' Every thread: someone was wrong."],
      ['h', 'Tonight I am going to try... sleeping. When it is dark. Like a raccoon, but backwards.'],
    ],
    choice: [
      { label: 'Sleep well, Ray.', reply: [['h', 'Thanks, {name}. You too. Seriously.']] },
      { label: 'Raccoons are nocturnal.', reply: [['h', 'See? I am learning things. Real things. About raccoons.']] },
    ],
    hint: ['n', 'Whoever sent you that slingshot... I think they are still out there. Somewhere past The Feed.'],
    followup: [
      ['h', 'Slept six hours. I feel like a brand new appliance.'],
      ['h', 'The sky does a whole show in the morning. Free tickets.'],
    ],
  },

  // ---------------- Finale: The Feed ----------------
  gordon: {
    name: 'Gordon', kind: 'bro',
    look: { skin: '#f2b89a', hair: '#c0602a', hairStyle: 'swoop', top: '#3fbf6a', bottom: '#2a3a5a', shoes: '#f4f4f4', eyes: '#3a6a3a', extras: ['chain', 'freckles'] },
    lines: [
      ['n', 'I had a 5 a.m. routine. A 4 a.m. routine. A 3 a.m. routine to prep for my 4 a.m. routine.'],
      ['h', "Know what I'm doing at 5 a.m. tomorrow? Sleeping. Then building a treehouse."],
      ['n', 'No reason. No audience. Just a treehouse.'],
    ],
    choice: [
      { label: 'Can I visit?', reply: [['h', "You're the first guest, {name}. The password is 'no phones.'"]] },
      { label: 'Treehouses rule.', reply: [['h', 'They really do. Why did I ever want a corner office instead?']] },
    ],
    hint: ['h', 'Thanks for knocking it out of my hand. Literally.'],
    followup: [
      ['h', 'Bought wood. Not a course about wood. Actual wood.'],
      ['h', 'Treehouse rule number one: snacks.'],
    ],
  },
  luna: {
    name: 'Luna', kind: 'influencer',
    look: { skin: '#6e4630', hair: '#e070b0', hairStyle: 'long', top: '#ffd23f', bottom: '#4a6ad8', shoes: '#ffffff', eyes: '#3a2010', extras: ['shades', 'hoops'] },
    lines: [
      ['n', 'My whole life was a grid of squares. Perfect, matching squares.'],
      ['h', 'Turns out dirt is not on brand. And I LOVE dirt.'],
      ['n', "I'm starting a garden. Tomatoes don't care how you look."],
    ],
    choice: [
      { label: 'Grow me a tomato.', reply: [['h', 'The first tomato is yours. Unfiltered. Slightly lumpy.']] },
      { label: 'Dirt is underrated.', reply: [['h', 'Dirt is the most authentic content there is.']] },
    ],
    hint: ['n', "I'm telling everyone about {name}. {They} looked up when nobody else did."],
    followup: [
      ['h', 'My garden has zero followers and one worm. Perfect.'],
      ['h', 'Planted basil. Named it Brad.'],
    ],
  },
  nell: {
    name: 'Nell', kind: 'doom',
    look: { skin: '#c68b5e', hair: '#3a1a10', hairStyle: 'curly', hat: 'beanie', hatColor: '#8a2a4a', top: '#2a8a8a', bottom: '#4a4a5a', shoes: '#ffd23f', eyes: '#3a2a10', extras: ['freckles'] },
    lines: [
      ['n', 'The feed told me everything was terrible. Every day. On purpose.'],
      ['n', "Some things ARE hard. But I can't fix them from bed at 2 a.m."],
      ['h', "So I'm learning to bake. Bread, not dread. That's my new motto."],
    ],
    choice: [
      { label: 'Bread, not dread!', reply: [['h', 'BREAD, NOT DREAD! Okay, I might make a sign. A paper one.']] },
      { label: 'What kind of bread?', reply: [['h', 'Sourdough. You have to feed it every day. Like a feed. But a nice one.']] },
    ],
    hint: ['n', 'Hey, {name}... thank you. You did not have to look up. But you did.'],
    followup: [
      ['h', 'My bread did not rise. I ate it anyway. Delicious failure.'],
      ['h', 'The neighbors smelled the bread. Now we have a bread club.'],
    ],
  },
};

// Names for the extra NPCs who reuse a conversation.
export const EXTRA_NAMES = [
  'Ava', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ike', 'Jo', 'Kai', 'Lia', 'Mo', 'Nia',
  'Oz', 'Pia', 'Quin', 'Rae', 'Sol', 'Tia', 'Uma', 'Vic', 'Wes', 'Yara', 'Zed',
];

const EXTRA_STYLES = {
  bro: { hairStyles: ['buzz', 'short', 'swoop'], hats: ['capBack', null, 'cap'], tops: ['#1fbfa5', '#ff8a3d', '#e8433f', '#3f7fe8'], bottoms: ['#4a4a5a', '#3a3a48'] },
  influencer: { hairStyles: ['long', 'bob', 'bun'], hats: [null], tops: ['#ff7eb6', '#7ee0ff', '#c9b0ff', '#ffd23f'], bottoms: ['#a98bff', '#ffb36b', '#e8d8b0'] },
  doom: { hairStyles: ['messy', 'short', 'curly'], hats: ['hood', null, 'beanie'], tops: ['#6a7a4a', '#7a4ab8', '#2a3a6a', '#2a8a8a'], bottoms: ['#4a4a5a', '#3a3a3a'] },
};
const SKINS = ['#f6d1b0', '#e8b48f', '#c68b5e', '#9a6440', '#6e4630', '#4a2e20'];
const HAIRS = ['#1a1210', '#3a2412', '#6b4426', '#c0602a', '#f3d36b', '#8a7a6a'];

// A deterministic extra person for a level slot.
export function extraLook(kind, seed) {
  const r = (n) => (((seed + 1) * 2654435761) >>> (n * 3)) % 997;
  const st = EXTRA_STYLES[kind];
  const pick = (arr, n) => arr[r(n) % arr.length];
  const hat = pick(st.hats, 2);
  return {
    skin: pick(SKINS, 0), hair: pick(HAIRS, 1), hairStyle: pick(st.hairStyles, 3), hat,
    hatColor: pick(['#27408b', '#8b2740', '#2a3a6a', '#3a6a4a'], 4), top: pick(st.tops, 5), bottom: pick(st.bottoms, 6),
    shoes: pick(['#f4f4f4', '#3a3a3a', '#ffd23f'], 7), eyes: '#3a2a1a',
    extras: kind === 'bro' && r(8) % 2 ? ['chain'] : kind === 'influencer' && r(8) % 2 ? ['hoops'] : [],
  };
}
