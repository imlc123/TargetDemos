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

**Algorithm meter:** it fills when the feed gets you (missed shots, cameras, auras, doom headlines, reply bubbles, voice waves) and drains when you're safe. If it fills, you get a phone and the level restarts.

**Calming down:** grab a **cup of tea** off the street (it takes 30 off the meter and comes back after 30 seconds), or **stand still next to a bench** to sit and breathe.

**When to shoot:** a **green arrow** appears over anyone whose phone can be broken right now (a market dip, a stun, replying to the void, an ad read).

### The five target demographics

- **Grindset Bro.** His chart only goes up. Wait for the **market dip** (red chart, he freezes), then hit his phone. Hit him while the line is green and he dashes off, and your meter goes up.
- **Aesthetic Influencer.** Always filming. Stay out of her camera cone or you get "content-ified" (stunned). Hit her phone from **behind**. Hedges and trees block her view.
- **Doom-Scroller.** Their aura drains you and blocks pebbles. Press action just as a doom headline reaches you to **deflect** it back as good news. That stuns them and drops their guard, and then you can break the phone.
- **Hot-Take Poster.** Once they spot you, they fire bursts of REPLY bubbles. You can't deflect those, but walls, trees and hedges block them. Break line of sight and they keep typing anyway: **replying to the void**. That's when the phone can break. Hit them while they're watching you and they fire straight back.
- **Podcast Guru.** Never stops talking. Voice waves push you back and bounce pebbles, and standing close fills the meter. Every few seconds he stops for an **AD READ**: no waves, no shield. Shoot then.

### The final boss: THE ENDLESS SCROLL

A black-pilled doom-scroller crawls out of The Feed's giant screen with every power in the city. The fight has three phases. In each one, the boss raises a **shield** and keeps pulling people you freed earlier back into the feed. Free enough of them to drop the shield, then crack the boss's phone the way that phase demands:

1. **Grindset:** hit it during a **market dip**, while dodging green candles that burst from the ground.
2. **Influencer:** two camera beams sweep the plaza; hit it from **behind**.
3. **Doom:** a draining aura and headline barrages; **deflect** a headline to stun it, then hit.

The people it pulls back in come from every block, Hot-Take Posters and Podcast Gurus included.

To keep the plaza readable, the boss holds at most three people in the feed at a time. Anyone you free cheers for a moment, then pops up to the street above the big screen and cheers from the sidelines (walk up there to chat with them). When the sidelines are full, extra people head home. Beat the boss and the whole crowd comes down to celebrate.

If the Algorithm meter fills, you restart the current phase, not the whole fight. Three cracks and the boss is freed too. You can talk to them afterwards.

### Your hero

The first time you press PLAY, the intro plays and then you name your hero and choose boy, girl or nonbinary (this sets their look and the pronouns people use for them), plus a skin tone and cap/hoodie colors. Change it any time with **EDIT HERO** on the menu; replay the opening with **WATCH INTRO**.

### Levels

| | Level | New type | Setting |
|---|---|---|---|
| 1 | The Hustle District | Grindset Bro | daytime glass towers, flyers in the wind |
| 2 | Aesthetic Avenue | Aesthetic Influencer | pastel shops at golden hour |
| 3 | Reply Row | Hot-Take Poster | old town at dusk: cobblestones, a canal with bridges, falling leaves |
| 4 | The Scroll | Doom-Scroller | rainy night plaza |
| 5 | Podcast Pier | Podcast Guru | sunset beach: boardwalk, sand, the sea, piers, a ferris wheel |
| 6 | The Feed | the boss | neon finale |

Levels 1–5 are 64x40-tile maps with four named characters each. Difficulty climbs gently from level 1 to level 5 (see `difficulty` in each level). Each level has its own lighting, which warms up as you free people. Water blocks walking, but pebbles fly over it.

Saves from before Reply Row and Podcast Pier existed are moved to the new level numbers.

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

## Generated art (Gemini)

Portraits, intro panels, the menu backdrop, level cards, building fronts and the bigger props were made with Google's Gemini image models and turned into pixel art. The PNGs are committed in `assets/img/` (about 1.3 MB), so the game doesn't call any API at runtime. `assets/img/manifest.json` lists them. If an image is missing, the game falls back to the art it draws in code (props without an image are left out).

To make or remake the art, you need a Gemini API key with billing enabled:

```bash
GEMINI_API_KEY=your-key python3 tools/gen_art.py
```

- `tools/art_manifest.py` lists every asset with its prompt, model and size. Key art uses `gemini-3-pro-image`; bulk art (hero variants, building fronts, props) uses `gemini-3.1-flash-image`.
- The script skips assets that already exist. Delete a PNG (and its raw files in `tools/raw/`) to remake it. Pass part of an id to make only some assets, for example `python3 tools/gen_art.py portrait_rex`.
- `--post` re-runs the pixel-art conversion on the saved raw images without calling the API.
- Raw downloads go to `tools/raw/`, which is not committed.
- `ART_WORKERS` sets how many requests run at once (default 4). Lower it if you hit rate limits.

Each generated image is cut out from a magenta background, shrunk with a box filter, reduced to a small palette and given a dark outline. Gray "locked" versions keep their neon colors.

### Portraits for the extra people (no API needed)

The unnamed extras get portraits remixed from the named characters' Gemini portraits:

```bash
python3 tools/remix_portraits.py
```

It gives each named character's portrait a new shirt, hair and hat color (and mirrors every other one), making 8 faces per character type. Faces and skin are left untouched. It writes `assets/img/portraits/extra_<type>_<n>.png` and `assets/img/portraits/extras.json`, which holds the matching walking-sprite colors for each face. Extras prefer remixes of characters who aren't in the same level. Check `tools/raw/remix_preview.png` after a run. If a portrait recolors badly, add the character to `OVERRIDES` at the top of the script to skip an area or keep a color. If `extras.json` is missing, extras fall back to code-drawn portraits.

## Editing the game

- **Characters and their conversations:** `js/data/characters.js` (names, looks, lines, the reply choice, hints and follow-ups; `{name}`, `{they}`, `{them}`, `{their}`, `{theyre}` become the hero's name and pronouns)
- **Speech bubbles, headlines, jokes:** `js/data/lines.js`
- **Themed props and signs:** the `props` list of each level in `js/data/levels.js`; prop art is in `js/art/props.js`
- **Level maps and who's in them:** `js/data/levels.js` (the map legend is at the top of the file; stack 3 rows of `W` and the generated building fronts are placed over them automatically). The Reply Row and Podcast Pier maps come from `tools/genmaps.py`; run `python3 tools/genmaps.py --check` after editing any level to make sure every spawn point, tea cup and prop sits on a walkable tile.
- **Ways to calm down:** the `calm` list of each level (tea cups) and `b` tiles in the map (benches); amounts are in the `calm` block of `TUNING`
- **Difficulty per level:** `difficulty` in each level (it scales how fast the meter fills and how long the openings last)
- **The boss:** tuning is in the `boss` block of `TUNING` in `js/config.js`; who gets pulled back in each phase is the `waves` list of the last level in `js/data/levels.js`, and where freed people cheer is its `sidelines` list; the boss's look is `BOSS_LOOK` in `js/art/boss.js`; their lines are `LINES.boss` in `js/data/lines.js`
- **Difficulty (speeds, timings, meter):** the `TUNING` object in `js/config.js`
- **The two newest types:** `js/entities/HotTakePoster.js` and `js/entities/PodcastGuru.js`, tuned in the `hottake` and `podcast` blocks of `TUNING`
- **Pixel art:** `js/art/sprites.js` (characters, painted part by part in three facings with colored outlines and hue-shifted shading), `js/art/portraits.js` (64x64 dialogue portraits), `js/art/tiles.js` (ground, water, sand, boardwalk, cobblestones and the six building styles), `js/art/intro.js` and `js/art/introPanels.js` (the bedroom and the intro's close-up panels), `js/art/boss.js` (the boss)

### Debug mode

Add `?debug=1` to the URL to unlock all levels and show hitboxes. `?debug=1&level=3` jumps straight to level 3. In debug mode, **N** frees everyone in the level, **K** fills the meter, and **B** drops the boss's shield or cracks its phone. `?debug=1&gallery=1` opens an art gallery of every sprite, portrait, prop and tile (keys 1-7 switch pages; pages 6 and 7 show the generated art).

## Project layout

```
index.html            page shell, loads Phaser and js/main.js
css/style.css         full-screen layout, "rotate your phone" hint
vendor/phaser.min.js  Phaser 3.90.0
js/main.js            game config
js/config.js          tuning and settings
js/scenes/            Boot, Menu, Intro, Create (hero), Game, UI (HUD + touch),
                      Card (pop-ups), Dialogue, Gallery (debug)
js/entities/          Player, Pebble, Headline, Prop, Boss, NPC + the five NPC types
js/systems/           Algorithm meter, touch controls, sound, save data, hero, people
js/art/               art drawn in code (pixels, sprites, portraits, tiles, props, intro)
js/data/              levels, characters and lines
assets/img/           generated pixel art (portraits, intro, cards, facades, props, ui)
tools/                gen_art.py + art_manifest.py (Gemini art), remix_portraits.py (extras'
                      portraits, no API), genmaps.py (maps and checks)
```
