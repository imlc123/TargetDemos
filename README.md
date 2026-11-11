# Target Demos

A small, mobile-friendly 2D web game about breaking free from the algorithmic identity loop.

It opens at 3:47 AM in a dark bedroom: you're scrolling, until a slingshot crashes through the window and knocks the phone out of your hand. A note is tied to it: "LOOK UP." You name your hero, pick how they look, and head out into a gray city where everyone is a "target demographic," glued to a screen and repeating recycled corporate talking points. Break their phones and the illusion shatters: they turn colorful, sniff flowers, chat with each other, and are happy to talk to you. Each block's props change too: the stock ticker starts saying NICE DAY :) and the news screens start running good news.

Built with [Phaser 3](https://phaser.io) (v3.90.0, included in `vendor/`). There's no build step: it's plain HTML and JavaScript modules.

## How to play

| | Desktop | Phone (landscape) |
|---|---|---|
| Move | WASD / Arrow keys | Drag anywhere on the left half |
| Shoot / Deflect | Space or J | Tap anywhere on the right half |
| Pause | Esc or P | Pause button (top right) |
| Mute | M | Speaker button |

The action button does whatever fits the moment:
1. If a doom headline is close, it **deflects** it.
2. If you're next to a freed person (a TALK tag appears over them), it starts a **conversation**.
3. Otherwise it **fires a pebble**, aimed at the nearest person in front of you. The aim marker turns **green** when a shot will break the phone.

**Talking:** every freed person has something to say, shown in a dialogue box with their portrait. Partway through you pick one of two replies. Your first chat with each person calms the Algorithm meter, and many of them pass on a tip about what's ahead. Talk again for a short follow-up. Each level has three named characters; extra people reuse one of those conversations.

**Algorithm meter:** it fills when the feed gets you (missed shots, cameras, auras, doom headlines) and drains when you're safe. If it fills, you get a phone and the level restarts.

### The three target demographics

- **Grindset Bro.** His chart only goes up. Wait for the **market dip** (red chart, he freezes), then hit his phone. Hit him while the line is green and he dashes off, and your meter goes up.
- **Aesthetic Influencer.** Always filming. Stay out of her camera cone or you get "content-ified" (stunned). Hit her phone from **behind**. Hedges and trees block her view.
- **Doom-Scroller.** Their aura drains you and blocks pebbles. Press action just as a doom headline reaches you to **deflect** it back as good news. That stuns them and drops their guard, and then you can break the phone.

### The final boss: THE ENDLESS SCROLL

A black-pilled doom-scroller crawls out of The Feed's giant screen with every power in the city. The fight has three phases. In each one, the boss raises a **shield** and keeps pulling people you freed earlier back into the feed. Free enough of them to drop the shield, then crack the boss's phone the way that phase demands:

1. **Grindset:** hit it during a **market dip**, while dodging green candles that burst from the ground.
2. **Influencer:** two camera beams sweep the plaza; hit it from **behind**.
3. **Doom:** a draining aura and headline barrages; **deflect** a headline to stun it, then hit.

If the Algorithm meter fills, you restart the current phase, not the whole fight. Three cracks and the boss is freed too. You can talk to them afterwards.

### Your hero

The first time you press PLAY, the intro plays and then you name your hero and choose boy, girl or nonbinary (this sets their look and the pronouns people use for them), plus a skin tone and cap/hoodie colors. Change it any time with **EDIT HERO** on the menu; replay the opening with **WATCH INTRO**.

### Levels

1. The Hustle District: meet the Grindset Bro (7 people)
2. Aesthetic Avenue: meet the Aesthetic Influencer (8 people)
3. The Scroll: meet the Doom-Scroller (9 people)
4. Finale, The Feed: the boss fight

Levels 1–3 are 64x40-tile maps with several districts each. Each has four named characters to talk to.

Progress is saved in your browser. The game still works if storage is blocked; it just won't remember progress.

## Run it locally

Browsers block JavaScript modules opened straight from `file://`, so serve the folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish on GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Pick the branch (for example `main`, or the feature branch while testing) and the **/ (root)** folder, then click **Save**.
4. After a minute the game is live at `https://<user>.github.io/<repo>/`.

The `.nojekyll` file tells Pages to serve the files exactly as they are.

## Editing the game

- **Characters and their conversations:** `js/data/characters.js` (names, looks, lines, the reply choice, hints and follow-ups; `{name}`, `{they}`, `{them}`, `{their}`, `{theyre}` become the hero's name and pronouns)
- **Speech bubbles, headlines, jokes:** `js/data/lines.js`
- **Themed props and signs:** the `props` list of each level in `js/data/levels.js`; prop art is in `js/art/props.js`
- **Level maps and who's in them:** `js/data/levels.js` (the map legend is at the top of the file; stack 2–3 rows of `W` for taller building fronts)
- **The boss:** tuning is in the `boss` block of `TUNING` in `js/config.js`; who gets pulled back in each phase is the `waves` list of the last level in `js/data/levels.js`; the boss's look is `BOSS_LOOK` in `js/art/boss.js`; their lines are `LINES.boss` in `js/data/lines.js`
- **Difficulty (speeds, timings, meter):** the `TUNING` object in `js/config.js`
- **Pixel art:** `js/art/sprites.js` (characters, painted part by part in three facings with colored outlines and hue-shifted shading), `js/art/portraits.js` (64x64 dialogue portraits), `js/art/tiles.js` (ground and the four building styles), `js/art/intro.js` and `js/art/introPanels.js` (the bedroom and the intro's close-up panels), `js/art/boss.js` (the boss)

### Debug mode

Add `?debug=1` to the URL to unlock all levels and show hitboxes. `?debug=1&level=3` jumps straight to level 3. In debug mode, **N** frees everyone in the level, **K** fills the meter, and **B** drops the boss's shield or cracks its phone. `?debug=1&gallery=1` opens an art gallery of every sprite, portrait, prop and tile (keys 1-4 switch pages).

## Project layout

```
index.html            page shell, loads Phaser and js/main.js
css/style.css         full-screen layout, "rotate your phone" hint
vendor/phaser.min.js  Phaser 3.90.0
js/main.js            game config
js/config.js          tuning and settings
js/scenes/            Boot, Menu, Intro, Create (hero), Game, UI (HUD + touch),
                      Card (pop-ups), Dialogue, Gallery (debug)
js/entities/          Player, Pebble, Headline, Prop, Boss, NPC + the three NPC types
js/systems/           Algorithm meter, touch controls, sound, save data, hero, people
js/art/               all art, drawn in code (pixels, sprites, portraits, tiles, props, intro)
js/data/              levels, characters and lines
```
