import { TUNING } from '../config.js';

// A slingshot pebble. Moved by hand (no physics body) and checked against tiles.
export class Pebble {
  constructor(scene, x, y, dx, dy) {
    this.scene = scene;
    this.sprite = scene.add.image(x, y, 'pebble').setDepth(4000);
    this.dx = dx;
    this.dy = dy;
    this.travel = 0;
    this.dead = false;
  }

  get x() {
    return this.sprite.x;
  }
  get y() {
    return this.sprite.y;
  }

  update(dt) {
    const step = TUNING.pebble.speed * dt;
    this.sprite.x += this.dx * step;
    this.sprite.y += this.dy * step;
    this.travel += step;
    if (this.travel > TUNING.pebble.range) this.die('fizzle');
    else if (this.scene.isSolidAt(this.sprite.x, this.sprite.y + 4)) this.die('wall');
  }

  die(kind) {
    if (this.dead) return;
    this.dead = true;
    if (kind !== 'hit') this.scene.fx.puff.explode(kind === 'fizzle' ? 2 : 4, this.sprite.x, this.sprite.y);
    if (kind === 'wall') this.scene.sfxOnce('thud');
    this.sprite.destroy();
  }
}
