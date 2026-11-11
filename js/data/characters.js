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
    hint: ['n', "Next stop is Reply Row. Everyone there is yelling. Duck out of sight and they start typing to nobody. That's your shot."],
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
    hint: ['n', "You can't swat a reply bubble back. Walls, trees and hedges stop them, though. Hide first, then pounce."],
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
    hint: ['n', 'If the Algorithm meter gets high, grab a cup of tea or stand by a bench. Breathe. It drains.'],
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
    hint: ['n', 'Past the rain there is a pier. The podcast guys there never stop talking. Except for the ads.'],
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

  // ---------------- Level 3: Reply Row ----------------
  rex: {
    name: 'Rex', kind: 'hottake',
    look: { skin: '#d8a878', hair: '#14100e', hairStyle: 'messy', top: '#24242c', bottom: '#3a3a48', shoes: '#ff3b4e', eyes: '#3a2a1a', extras: ['angry', 'eyebags'] },
    lines: [
      ['n', "Huh. I was in the middle of telling a stranger they were wrong about soup."],
      ['n', "Four hundred replies. I won every argument. I have zero friends."],
      ['h', "Wait. You knocked my phone out and I didn't even get the last word. That's... freeing?"],
    ],
    choice: [
      { label: 'Who won the soup fight?', reply: [['h', "NOBODY. Soup won. Soup is great. I'm getting soup."]] },
      { label: 'You can just log off.', reply: [['n', "Log off? With people WRONG out there?"], ['h', "...Yeah. Let them be wrong. I'll be outside."]] },
    ],
    hint: ['n', "Next is The Scroll. They throw doom headlines. Swat one right when it reaches you and it flies back as good news."],
    followup: [
      ['h', "Someone said pineapple goes on pizza. I said 'cool.' I'm healing."],
      ['h', 'I wrote a nice comment. On a real wall. It said "nice wall."'],
    ],
  },
  mona: {
    name: 'Mona', kind: 'hottake',
    look: { skin: '#f6d1b0', hair: '#c8bca0', hairStyle: 'bob', top: '#d9a63a', bottom: '#5a4a3a', shoes: '#8a2a3a', eyes: '#3a6a5a', extras: ['glasses'] },
    lines: [
      ['n', "Well, actually... hm. I don't know what comes after 'well, actually.'"],
      ['n', "I corrected a man's grammar for nine years. He was a bot. I won, I think."],
      ['h', "My shoulders just came down from my ears. Is that where they live?"],
    ],
    choice: [
      { label: "You don't have to be right.", reply: [['h', "...Oh. OH. That's the nicest thing anyone's said to me since dial-up."]] },
      { label: 'Well, actually, hi!', reply: [['h', "Ha! Touche, {name}. Well, actually, hi yourself."]] },
    ],
    hint: ['n', "Doom-Scrollers have a dark aura that bounces pebbles. Stun them with their own headline, then aim."],
    followup: [
      ['h', "I'm in a book club now. We just say 'ooh' a lot. It's lovely."],
      ['n', "Someone used 'literally' wrong. I let it go. Like a balloon."],
    ],
  },
  theo: {
    name: 'Theo', kind: 'hottake',
    look: { skin: '#9a6440', hair: '#1a1210', hairStyle: 'short', hat: 'beanie', hatColor: '#8a2a3a', top: '#8a6a4a', bottom: '#4a3a2a', shoes: '#5a3a2a', eyes: '#2a1a12', extras: ['glasses', 'stubble'] },
    lines: [
      ['n', "I was captain of the debate club. Then the internet made everything a debate."],
      ['n', "Breakfast? Debate. Weather? Debate. My own mother's birthday? Heated debate."],
      ['h', "But right now it's just quiet. There's no other side to quiet."],
    ],
    choice: [
      { label: 'Want to just agree?', reply: [['h', "Agreed. Wow. That was easy. Let's do it again sometime."]] },
      { label: 'Debate me: naps rule.', reply: [['h', "I... concede. Immediately. Naps rule. Motion passed."]] },
    ],
    hint: ['n', "When a poster loses sight of you for a second, they type to the void. Green arrow over their head? Fire."],
    followup: [
      ['h', 'I started a club where we just listen. Membership: me and a pigeon.'],
      ['h', 'My mom and I agreed on a pie. Historic.'],
    ],
  },
  pat: {
    name: 'Uncle Pat', kind: 'hottake',
    look: { skin: '#f0b494', hair: '#a8a098', hairStyle: 'buzz', top: '#b8333a', bottom: '#3a4a6a', shoes: '#5a3a2a', eyes: '#3a5a7a', extras: ['stubble'] },
    lines: [
      ['n', "I used to share stuff in ALL CAPS. Didn't read it. Just shared it."],
      ['n', "My nephew stopped coming to barbecue. I thought it was the potato salad."],
      ['h', "It wasn't the potato salad. Kid. I'm gonna call him."],
    ],
    choice: [
      { label: 'Call him today!', reply: [['h', "TODAY! No caps. Just a normal voice. Like a person."]] },
      { label: "How's the potato salad?", reply: [['h', "Honestly? Elite. That part I'll keep."]] },
    ],
    hint: ['n', "Running low on chill? Grab a cup of tea off the street. Or sit on a bench a sec. Works for me."],
    followup: [
      ['h', 'My nephew is coming Sunday. Bringing his band. Called The Rest Days?'],
      ['h', "I forwarded a picture of a sunset. Just the sunset. No caption."],
    ],
  },

  // ---------------- Level 5: Podcast Pier ----------------
  bryce: {
    name: 'Bryce', kind: 'podcast',
    look: { skin: '#d8a878', hair: '#3a2412', hairStyle: 'swoop', top: '#1e1e24', bottom: '#3a3a48', shoes: '#f4f4f4', eyes: '#3a5a4a', extras: ['headphones'] },
    lines: [
      ['n', "Welcome back to the show. Episode... I lost count. I was the only listener."],
      ['n', "I explained crypto to the ocean for six hours. It just kept waving."],
      ['h', "Now I'm talking to you. With no microphone. It's so... small. And nice."],
    ],
    choice: [
      { label: 'I like this show better.', reply: [['h', "Same. Zero sponsors. Infinite vibes. Five stars."]] },
      { label: 'What IS crypto?', reply: [['n', "...I genuinely do not know, {name}."], ['h', "And I'm free from needing to know! Ha!"]] },
    ],
    hint: ['n', "The Feed is downtown. Biggest screen you've ever seen. It pulls people back in. Be ready."],
    followup: [
      ['h', "I listened to a friend for a whole hour. Didn't interrupt once. Personal best."],
      ['h', 'The seagulls are the real podcast. Unscripted. Raw.'],
    ],
  },
  sky: {
    name: 'Sky', kind: 'podcast',
    look: { skin: '#6e4630', hair: '#1a1210', hairStyle: 'long', top: '#e8dcc0', bottom: '#a8846a', shoes: '#ffd23f', eyes: '#2a1a12', extras: ['headphones', 'hoops'] },
    lines: [
      ['n', "My podcast was about mindfulness. I recorded it while doing four other things."],
      ['n', "I told a million people to breathe. I forgot to, myself."],
      ['h', "Okay. In... and out. Oh! That's what that feels like!"],
    ],
    choice: [
      { label: 'Breathe with me?', reply: [['h', "In for four... out for four... we're doing it, {name}! Live! No recording!"]] },
      { label: 'You were very calm.', reply: [['n', "I was very calm ON MIC."], ['h', "Now I'll try it off mic. The hard mode."]] },
    ],
    hint: ['n', "The waves push you back and bounce pebbles. Wait for the AD READ sign. That's when the shield drops."],
    followup: [
      ['h', 'I meditated for ten minutes. Nobody knows. That is the point.'],
      ['h', 'The sea breathes in and out too. We are basically twins.'],
    ],
  },
  gus: {
    name: 'Gus', kind: 'podcast',
    look: { skin: '#f0d0b0', hair: '#6b4426', hairStyle: 'short', hat: 'cap', hatColor: '#c8603a', top: '#5a6a3a', bottom: '#4a4a3a', shoes: '#5a3a2a', eyes: '#4a5a3a', extras: ['stubble'] },
    lines: [
      ['n', "Birds aren't real. Wait. That one just pooped on me. That's real."],
      ['n', "I had a theory about everything. The theory was: be scared of everything."],
      ['h', "The bird thing was a bit much. Birds are cool. Birds are so cool."],
    ],
    choice: [
      { label: 'Birds are real.', reply: [['h', "Birds ARE real! I'm gonna go look at like fifty of them."]] },
      { label: 'Any new theories?', reply: [['h', "Just one: people are mostly nice. Wild, right? Spread the word."]] },
    ],
    hint: ['n', "Free folks walk around and sniff flowers. The Feed hates that. It means the city's waking up."],
    followup: [
      ['h', "Saw a pelican. Talked to the pelican. It didn't sell me anything."],
      ['h', 'New theory: sandwiches taste better at the beach. Confirmed.'],
    ],
  },
  val: {
    name: 'Val', kind: 'podcast',
    look: { skin: '#e8b48f', hair: '#2a1a12', hairStyle: 'pony', top: '#3a4a6a', bottom: '#2a2a34', shoes: '#3a3a3a', eyes: '#3a2a1a', extras: ['headphones'] },
    lines: [
      ['n', "Four-hour interviews. Every week. I asked everyone everything."],
      ['n', "I never once asked anyone 'how are you?' Not really."],
      ['h', "So. {name}. How are you? Really?"],
    ],
    choice: [
      { label: "Honestly? Pretty good.", reply: [['h', "Pretty good! I love that answer. No follow-up needed."]] },
      { label: 'A little tired.', reply: [['h', "Same. Let's both sit by the water and be tired together."]] },
    ],
    hint: ['n', "When The Feed's shield is up, it needs people locked in. Free them and the shield cracks."],
    followup: [
      ['h', 'I had a conversation with no microphone. Felt like flying.'],
      ['h', 'My coffee is still warm. I actually drank it. While it was warm!'],
    ],
  },
};

// The final boss once freed. Their black-pilled form is built in js/art/boss.js.
CHARACTERS.dale = {
  name: 'Dale', kind: 'doom',
  look: { skin: '#d8b49a', hair: '#3a2a22', hairStyle: 'messy', top: '#7a8ab8', bottom: '#4a4a5a', shoes: '#c08a55', eyes: '#4a6a8a', extras: ['eyebags', 'stubble'] },
  lines: [
    ['n', 'I was the feed. Or the feed was me. Hard to tell after year nine.'],
    ['n', 'Every ad, every rage post, every "you won\'t believe"... it all ran through my thumbs.'],
    ['h', 'And you just... hit my phone with a rock. Three times.'],
  ],
  choice: [
    { label: 'Want to go outside?', reply: [['h', 'Yeah. Yeah, I really do. Is it always this bright?']] },
    { label: 'You okay, Dale?', reply: [['n', 'No. But I think I could be. That\'s new.'], ['h', 'Thanks for asking, {name}. Nobody asks.']] },
  ],
  hint: ['h', 'Go see your friends, {name}. They\'re all out there. Touching grass. Literally.'],
  followup: [
    ['h', 'I named a pigeon. It ignored me. Perfect relationship.'],
    ['h', 'Turns out a sunset has no comment section.'],
  ],
};

// What freed people say when the boss pulls them back in and you free them again.
export const RELAPSE_LINES = [
  ['h', 'Whoa. It pulled me right back in. Thanks for getting me out. Again!'],
  ['n', 'One notification. That\'s all it took. One.'],
  ['h', 'Okay, I owe you two favors now, {name}.'],
  ['n', 'The big one is feeding on all of us. Free everyone and its shield breaks!'],
];

// Names for the extra NPCs who reuse a conversation.
export const EXTRA_NAMES = [
  'Ava', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay', 'Bo', 'Hana', 'Ike', 'Jo', 'Kai', 'Lia', 'Mo', 'Nia',
  'Oz', 'Pia', 'Quin', 'Rae', 'Sol', 'Tia', 'Uma', 'Vic', 'Wes', 'Yara', 'Zed', 'Bea', 'Cy', 'Dot', 'Lou',
];

export const EXTRA_STYLES = {
  bro: { hairStyles: ['buzz', 'short', 'swoop'], hats: ['capBack', null, 'cap'], tops: ['#1fbfa5', '#ff8a3d', '#e8433f', '#3f7fe8'], bottoms: ['#4a4a5a', '#3a3a48'] },
  influencer: { hairStyles: ['long', 'bob', 'bun'], hats: [null], tops: ['#ff7eb6', '#7ee0ff', '#c9b0ff', '#ffd23f'], bottoms: ['#a98bff', '#ffb36b', '#e8d8b0'] },
  doom: { hairStyles: ['messy', 'short', 'curly'], hats: ['hood', null, 'beanie'], tops: ['#6a7a4a', '#7a4ab8', '#2a3a6a', '#2a8a8a'], bottoms: ['#4a4a5a', '#3a3a3a'] },
  hottake: { hairStyles: ['messy', 'short', 'bob'], hats: [null, 'beanie', 'cap'], tops: ['#2a2a34', '#8a2a3a', '#3a3a5a', '#5a2a2a'], bottoms: ['#3a3a48', '#4a3a3a'] },
  podcast: { hairStyles: ['swoop', 'pony', 'short'], hats: [null, 'beanie'], tops: ['#e8dcc0', '#2a2a2a', '#4a6a8a', '#8a6a4a'], bottoms: ['#3a3a48', '#5a4a3a'] },
};
export const SKINS = ['#f6d1b0', '#e8b48f', '#c68b5e', '#9a6440', '#6e4630', '#4a2e20'];
export const HAIRS = ['#1a1210', '#3a2412', '#6b4426', '#c0602a', '#f3d36b', '#8a7a6a'];

// A remixed Gemini portrait for an extra person, with the sprite look that matches it.
// Variants of characters who already appear in this level are used last.
// Returns null when the remix data isn't loaded (the code-drawn portrait is used then).
export function extraVariant(scene, kind, seed, avoid = []) {
  const all = scene.cache.json.get('extraPortraits')?.[kind] || [];
  const usable = all.filter((v) => scene.textures.exists(`gen:${v.file}`));
  if (!usable.length) return null;
  const fresh = usable.filter((v) => !avoid.includes(v.base));
  const pool = fresh.length >= 2 ? fresh : usable;
  const v = pool[seed % pool.length];
  return { look: { ...v.look }, genKey: `gen:${v.file}` };
}

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
    extras: kind === 'bro' && r(8) % 2 ? ['chain'] : kind === 'influencer' && r(8) % 2 ? ['hoops']
      : kind === 'hottake' ? (r(8) % 2 ? ['angry'] : ['glasses']) : kind === 'podcast' ? ['headphones'] : [],
  };
}
