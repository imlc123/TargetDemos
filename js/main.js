import { VIEW, DEBUG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { CardScene } from './scenes/CardScene.js';
import { Sfx } from './systems/Sfx.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW.width,
  height: VIEW.height,
  backgroundColor: '#0d0b16',
  pixelArt: true,
  roundPixels: true,
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: DEBUG } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4 },
  scene: [BootScene, MenuScene, GameScene, UIScene, CardScene],
};

// Audio can only start after the player touches or presses something.
const unlock = () => Sfx.unlock();
['pointerdown', 'touchend', 'keydown'].forEach((e) => window.addEventListener(e, unlock, { passive: true }));

let started = false;
function start() {
  if (started) return;
  started = true;
  window.__targetDemos = new Phaser.Game(config);
}

// Wait briefly for the pixel font so text renders crisp; start anyway if it's slow.
if (document.fonts && document.fonts.load) {
  document.fonts.load('16px "Press Start 2P"').then(start, start);
  setTimeout(start, 2500);
} else {
  start();
}
