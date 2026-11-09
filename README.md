# Target Demos

A small, mobile-friendly 2D web game about breaking free from the algorithmic identity loop.

You play a phone-less kid with a slingshot in a gray city where everyone is a "target demographic," glued to a screen and repeating recycled corporate talking points. Break their phones and the illusion shatters: they turn colorful, sniff flowers, and talk to each other. The city gets its color back as you go.

Built with [Phaser 3](https://phaser.io) (v3.90.0, included in `vendor/`). There's no build step: it's plain HTML and JavaScript modules.

## How to play

| | Desktop | Phone (landscape) |
|---|---|---|
| Move | WASD / Arrow keys | Drag anywhere on the left half |
| Shoot / Deflect | Space or J | Tap anywhere on the right half |
| Pause | Esc or P | Pause button (top right) |
| Mute | M | Speaker button |

The action button does whatever fits the moment. If a doom headline is close, it **deflects** it. Otherwise it **fires a pebble**, aimed at the nearest person in front of you. The aim marker turns **green** when a shot will break the phone.

**Algorithm meter:** it fills when the feed gets you (missed shots, cameras, auras, doom headlines) and drains when you're safe. If it fills, you get a phone and the level restarts.

### The three target demographics

- **Grindset Bro.** His chart only goes up. Wait for the **market dip** (red chart, he freezes), then hit his phone. Hit him while the line is green and he dashes off, and your meter goes up.
- **Aesthetic Influencer.** Always filming. Stay out of her camera cone or you get "content-ified" (stunned). Hit her phone from **behind**. Hedges and trees block her view.
- **Doom-Scroller.** Their aura drains you and blocks pebbles. Press action just as a doom headline reaches you to **deflect** it back as good news. That stuns them and drops their guard, and then you can break the phone.

### Levels

1. The Hustle District: meet the Grindset Bro
2. Aesthetic Avenue: meet the Aesthetic Influencer
3. The Scroll: meet the Doom-Scroller
4. Finale, The Feed: everyone at once

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

- **Dialogue, headlines, jokes:** `js/data/lines.js`
- **Level maps and who's in them:** `js/data/levels.js` (the map legend is at the top of the file)
- **Difficulty (speeds, timings, meter):** the `TUNING` object in `js/config.js`
- **Pixel art and colors:** `js/art/pixels.js` (sprites are text grids; each letter is a color)

### Debug mode

Add `?debug=1` to the URL to unlock all levels and show hitboxes. `?debug=1&level=3` jumps straight to level 3. In debug mode, **N** frees everyone in the level and **K** fills the meter.

## Project layout

```
index.html            page shell, loads Phaser and js/main.js
css/style.css         full-screen layout, "rotate your phone" hint
vendor/phaser.min.js  Phaser 3.90.0
js/main.js            game config
js/config.js          tuning and settings
js/scenes/            Boot, Menu, Game, UI (HUD + touch), Card (pop-ups)
js/entities/          Player, Pebble, Headline, NPC + the three NPC types
js/systems/           Algorithm meter, touch controls, sound, save data
js/art/pixels.js      all art, drawn in code
js/data/              levels and lines
```
