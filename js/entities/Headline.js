import { TUNING, FONT } from '../config.js';
import { LINES, pick } from '../data/lines.js';

// A doom headline fired by a Doom-Scroller. Deflect it and it turns into good news
// that flies back and stuns them.
export class Headline {
  constructor(scene, source, x, y, dirX, dirY) {
    this.scene = scene;
    this.source = source;
    this.reflected = false;
    this.dead = false;
    this.life = 7;
    const s = TUNING.doom.headlineSpeed;
    this.vx = dirX * s;
    this.vy = dirY * s;
    this.sprite = scene.add.image(x, y, 'paper_doom').setDepth(4500);
    this.label = scene.add
      .text(x, y - 7, pick(LINES.doom.headlines), {
        fontFamily: FONT, fontSize: '8px', color: '#ff8fa0', backgroundColor: '#2a0a14',
        padding: { x: 2, y: 1 }, resolution: 2,
      })
      .setOrigin(0.5, 1)
      .setDepth(4501);
  }

  get x() {
    return this.sprite.x;
  }
  get y() {
    return this.sprite.y;
  }

  reflect() {
    this.reflected = true;
    this.life = 3;
    this.sprite.setTexture('paper_good');
    this.label.setText(pick(LINES.doom.good));
    this.label.setColor('#5a3a00');
    this.label.setBackgroundColor('#ffe066');
    this.target = this.source;
    this.scene.fx.star.explode(6, this.x, this.y);
  }

  update(dt, player) {
    this.life -= dt;
    if (this.reflected) {
      // Home in on the scroller who sent it (or any other one still locked).
      if (!this.target || this.target.state !== 'locked') this.target = this.scene.nearestLockedDoom(this.x, this.y);
      const sp = TUNING.doom.reflectSpeed;
      if (this.target) {
        const a = Math.atan2(this.target.cy - this.y, this.target.cx - this.x);
        this.vx = Math.cos(a) * sp;
        this.vy = Math.sin(a) * sp;
      }
    }
    this.sprite.x += this.vx * dt;
    this.sprite.y += this.vy * dt;
    this.label.setPosition(this.sprite.x, this.sprite.y - 6);

    // Glow when it can be deflected
    if (!this.reflected && player) {
      const d = Math.hypot(this.x - player.cx, this.y - player.cy);
      const inWindow = d < TUNING.parry.radius;
      this.sprite.setScale(inWindow ? 1.35 : 1);
      this.sprite.setTint(inWindow && Math.floor(this.life * 16) % 2 ? 0xffff66 : 0xffffff);
    }

    if (this.life <= 0 || (!this.reflected && this.scene.isSolidAt(this.x, this.y + 4))) this.die();
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.scene.fx.puff.explode(4, this.x, this.y);
    this.sprite.destroy();
    this.label.destroy();
    if (this.source && this.source.activeHeadline === this) this.source.activeHeadline = null;
  }
}
