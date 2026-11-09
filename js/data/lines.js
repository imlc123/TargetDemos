// Everything people say. Edit freely: lines are picked at random.
// Keep speech lines short (about 40 characters) so bubbles stay small.
// Headlines must stay very short (9 characters or fewer).

export const LINES = {
  bro: {
    talk: [
      'Sleep is a bear market.',
      'Rise. Grind. Repeat.',
      'Your 9-to-5 is a cage, bro.',
      "I don't have friends. I have a network.",
      'Hydrate. Dominate. Monetize.',
      'Woke up at 4am to watch a guy wake up at 4am.',
      "Every hobby is a side hustle you haven't scaled.",
      'Weekends are for the weak.',
      'Cold plunge. Hot take. Repeat.',
      'Buy the course. Become the course.',
      'Rest days are a mindset problem.',
    ],
    dash: ["Can't stop. Won't stop.", 'Bullish!', 'Diamond hands!', 'Line goes UP!', "Not now, I'm compounding."],
    dip: ['MARKET DIP!', "Wait... it's going down?", 'NOT THE DIP!', 'Sell?! Hold?!'],
    shove: ['Out of my lane!', 'Move, I have a call!', 'Network or get out!'],
    freed: [
      'I... I like birds?',
      'When did I last take a nap?',
      'Want to get a sandwich? No reason.',
      'My hands feel so light.',
      'Is that... the sun?',
      "I'm gonna call my mom. Just to talk.",
    ],
  },
  influencer: {
    talk: [
      "Don't forget to like and subscribe!",
      'This sidewalk? Sponsored.',
      'Living my best life (take 47).',
      'Use code AUTHENTIC for 20% off.',
      'Get ready with me: to get ready.',
      "I'm just being so real right now.",
      'Is this lighting giving main character?',
      'Ugh, the algorithm hates me today.',
      'Morning routine step one: film it.',
    ],
    filmed: ['Ooh, b-roll!', "You're in my story now!", 'Tag me!', 'CONTENT!', "Hold still, you're trending!"],
    spotted: ['Ew, unflattering angle!', 'Not from the FRONT!', 'Wait, are you filming ME?'],
    turn: ['Outfit check!', 'Hold on, angles.', 'Hmm, better light over here.'],
    freed: [
      'I forgot what my face looks like unfiltered. Nice!',
      "These flowers aren't for anyone. I love that.",
      "I don't need to post this. Wow.",
      'Want to just... sit?',
      'My thumbs are on vacation.',
      'Is this what a sunset feels like?',
    ],
  },
  doom: {
    talk: [
      'Everything is terrible. Refreshing...',
      'Just five more minutes. (3 hours ago)',
      "Can't look away. Won't look away.",
      "I've read every comment. All of them.",
      "The feed says it's over. It's always over.",
      'Why am I so tired? *scrolls*',
    ],
    headlines: ["IT'S OVER", 'PANIC!', 'DOOM', 'CRISIS!', 'YOU LOSE', 'WORSE!!', 'DREAD', 'AAAAA!', 'THE END'],
    good: ['BEES!', 'HOPE!', 'HUGS!', 'SUNSHINE', 'KINDNESS', 'PUPPIES!', "YOU'RE OK", 'FRIENDS!'],
    blocked: ["Can't hear you, scrolling.", 'Shh. New post.', '*doesn\'t look up*'],
    stunned: ['...wait, good news?', 'Huh? Bees are back?', "I didn't know that was allowed."],
    freed: [
      'The sky is... a color?',
      'I can feel my neck again.',
      'Things are hard, but people are kind.',
      "Hi. I'm here. Actually here.",
      'Wanna go for a walk?',
      'Huh. Nothing is on fire.',
    ],
  },
  thanks: ['Thanks, kid!', 'You did that?', 'Hey, slingshot kid!', 'Feels good out here.', 'Want a flower?'],
  chat: [
    ['Nice weather!', "Isn't it?"],
    ['I love your face!', "It's my only one!"],
    ['Want to start a garden?', 'YES.'],
    ['What do you do?', 'Right now? This.'],
    ['Hi!', 'Hi!!'],
    ['Did you see that bird?', 'I SAW THAT BIRD.'],
    ['I forgot how to small talk.', "Me too. It's nice."],
  ],
  fail: [
    'The feed got you. Shake it off and try again.',
    'You got a phone. Then you got a ring light. Then you got a podcast. Try again.',
    'Personalized ads unlocked. Freedom locked. Try again.',
  ],
  contentified: ['CONTENT-IFIED!', 'POSTED!', 'TAGGED!'],
};

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
