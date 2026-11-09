import { TUNING, FONT, TILE } from '../config.js';
import { LINES, pick } from '../data/lines.js';
import { Sfx } from '../systems/Sfx.js';

const { Vector2 } = Phaser.Math;
const rand = Phaser.Math.FloatBetween;

// Shared behavior for every "target demographic": the phone, speech bubbles,
// getting freed, and what freed people do afterwards.
export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, kind, look) {
    super(scene, x, y, `${kind}_${look}_gray_0`);
    this.kind = kind;
    this.look = look;
    this.variant = 'gray';
    this.frameIdx = 0;
    this.animT = Math.random();
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.body.setSize(10, 5).setOffset(3, 15);

    this.state = 'locked';
    this.lines = LINES[kind];
    this.shadow = scene.add.image(x, y, 'shadow').setDepth(4);
    this.phone = scene.add.rectangle(x, y, 3, 5, 0x7fd1ff).setStrokeStyle(1, 0x15151c);
    this.glow = scene.add.image(x, y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setScale(0.55).setAlpha(0.5).setTint(0x7fd1ff);
    this.bubble = null;
    this.bubbleT = 0;
    this.talkT = rand(0.5, 4);
    this.bubbleLift = 22;

    // freed-state AI
    this.mode = null;
    this.modeT = 0;
    this.target = null;
    this.stuckT = 0;
    this.lastPos = new Vector2(x, y);
  }

  get cx() {
    return this.x;
  }
  get cy() {
    return this.y - 10;
  }

  // Where the phone is held, relative to the feet. Subclasses override.
  phoneOffset() {
    return { x: 6, y: -14 };
  }

  // Whether a pebble flying in direction (dx, dy) would break the phone right now.
  isVulnerableTo() {
    return false;
  }

  setPhoneColor(c) {
    if (!this.phone) return;
    this.phone.setFillStyle(c);
    this.glow.setTint(c);
  }

  playerDist() {
    const p = this.scene.player;
    return Math.hypot(p.x - this.x, p.y - this.y);
  }

  say(text, dur = 2.8, style = this.state) {
    if (!this.bubble) {
      this.bubble = this.scene.add
        .text(this.x, this.y, '', {
          fontFamily: FONT, fontSize: '8px', align: 'center', resolution: 2,
          padding: { x: 3, y: 3 }, lineSpacing: 2, wordWrap: { width: 118 },
        })
        .setOrigin(0.5, 1)
        .setDepth(5000);
    }
    const locked = style === 'locked';
    this.bubble.setColor(locked ? '#9fe8ff' : '#5a3a1a');
    this.bubble.setBackgroundColor(locked ? '#161626' : '#fff3d0');
    this.bubble.setText(text).setVisible(true).setAlpha(1);
    this.bubbleT = dur;
  }

  // ---------- main loop ----------
  update(dt) {
    if (this.state === 'locked') this.updateLocked(dt);
    else this.updateFreed(dt);

    // talking
    this.talkT -= dt;
    if (this.talkT <= 0) {
      const near = this.playerDist() < 120;
      if (this.state === 'locked' && near) {
        this.say(pick(this.lines.talk), 2.8);
        this.talkT = rand(4.5, 7.5);
      } else if (this.state === 'freed' && this.mode !== 'chat' && near && Math.random() < 0.5) {
        this.say(pick(Math.random() < 0.5 ? LINES.thanks : this.lines.freed), 2.4);
        this.talkT = rand(6, 10);
      } else {
        this.talkT = rand(1.5, 3);
      }
    }

    // walk animation
    const moving = this.body.velocity.lengthSq() > 25;
    if (moving) {
      this.animT += dt;
      if (this.animT > 0.16) {
        this.animT = 0;
        this.frameIdx ^= 1;
      }
    } else {
      this.frameIdx = 0;
    }
    this.setTexture(`${this.kind}_${this.look}_${this.variant}_${this.frameIdx}`);
    if (Math.abs(this.body.velocity.x) > 4) this.setFlipX(this.body.velocity.x < 0);

    // attachments
    const d = 100 + this.y;
    this.setDepth(d);
    this.shadow.setPosition(this.x, this.y - 1);
    if (this.phone) {
      const o = this.phoneOffset();
      this.phone.setPosition(this.x + o.x, this.y + o.y).setDepth(d + 0.5);
      this.glow.setPosition(this.x + o.x, this.y + o.y).setDepth(d + 0.6);
    }
    if (this.bubble) {
      this.bubbleT -= dt;
      this.bubble.setPosition(this.x, this.y - this.bubbleLift);
      if (this.bubbleT <= 0) this.bubble.setVisible(false);
      else if (this.bubbleT < 0.3) this.bubble.setAlpha(this.bubbleT / 0.3);
    }
  }

  updateLocked() {}

  // ---------- freeing ----------
  free() {
    if (this.state !== 'locked') return;
    this.state = 'freed';
    const s = this.scene;
    if (this.phone) {
      s.fx.shard.explode(16, this.phone.x, this.phone.y);
      this.phone.destroy();
      this.glow.destroy();
      this.phone = null;
      this.glow = null;
    }
    this.onFreed();
    this.variant = 'color';
    this.setAngle(0);
    this.setVelocity(0, 0);
    this.setScale(1.3);
    s.tweens.add({ targets: this, scale: 1, duration: 420, ease: 'Back.Out' });
    s.fx.heart.explode(5, this.x, this.y - 18);
    s.cameras.main.shake(140, 0.004);
    Sfx.play('shatter');
    s.time.delayedCall(180, () => Sfx.play('freed'));
    this.bubbleLift = 22;
    this.say(pick(this.lines.freed), 3.4, 'freed');
    this.talkT = rand(5, 8);
    this.mode = 'celebrate';
    this.modeT = 1.8;
    s.onNpcFreed(this);
  }

  // Subclasses clean up their extras (chart, cone, aura) here.
  onFreed() {}

  // ---------- freed behavior ----------
  updateFreed(dt) {
    this.modeT -= dt;
    switch (this.mode) {
      case 'celebrate':
      case 'idle':
      case 'await':
        this.setVelocity(0, 0);
        if (this.modeT <= 0) {
          if (this.mode === 'await' && this.partner) this.partner.releaseChat();
          this.pickMode();
        }
        break;
      case 'sniff':
        this.setVelocity(0, 0);
        if (Math.random() < dt * 2.5) this.scene.fx.pollen.explode(2, this.x + (this.flipX ? -4 : 4), this.y - 6);
        if (Math.random() < dt * 0.8) this.scene.fx.heart.explode(1, this.x, this.y - 20);
        if (this.modeT <= 0) {
          this.scene.releaseFlower(this);
          this.pickMode();
        }
        break;
      case 'chat':
        this.setVelocity(0, 0);
        if (this.partner) this.setFlipX(this.partner.x < this.x);
        if (Math.random() < dt * 0.6) this.scene.fx.heart.explode(1, this.x, this.y - 20);
        if (this.modeT <= 0) this.endChat();
        break;
      case 'walk':
        this.walkTo(dt);
        break;
      default:
        this.pickMode();
    }
  }

  walkTo(dt) {
    let tx = this.target.x;
    let ty = this.target.y;
    if (this.purpose === 'chat' && this.partner) {
      tx = this.partner.x + (this.x < this.partner.x ? -14 : 14);
      ty = this.partner.y;
    }
    const dx = tx - this.x;
    const dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 3) {
      this.setVelocity(0, 0);
      this.arrive();
      return;
    }
    const sp = TUNING.freed.speed;
    this.setVelocity((dx / d) * sp, (dy / d) * sp);

    // stuck detection
    this.stuckT += dt;
    if (this.stuckT > 0.7) {
      const moved = Phaser.Math.Distance.Between(this.x, this.y, this.lastPos.x, this.lastPos.y);
      this.lastPos.set(this.x, this.y);
      this.stuckT = 0;
      if (moved < 3 || this.modeT < -8) this.giveUp();
    }
  }

  arrive() {
    if (this.purpose === 'flower') {
      this.mode = 'sniff';
      this.modeT = rand(2.5, 4);
      this.setFlipX(this.target.x < this.x);
      Sfx.play('pop');
    } else if (this.purpose === 'chat' && this.partner && this.partner.mode === 'await') {
      const pair = pick(LINES.chat);
      this.startChat(this.partner, pair[0]);
      this.partner.startChat(this, pair[1], 1.1);
    } else {
      this.mode = 'idle';
      this.modeT = rand(1, 2.5);
    }
  }

  giveUp() {
    if (this.purpose === 'flower') this.scene.releaseFlower(this);
    if (this.purpose === 'chat' && this.partner) this.partner.releaseChat();
    this.partner = null;
    this.mode = 'idle';
    this.modeT = rand(0.3, 1);
  }

  startChat(partner, line, delay = 0) {
    this.mode = 'chat';
    this.modeT = 3.6;
    this.partner = partner;
    this.setVelocity(0, 0);
    this.scene.time.delayedCall(delay * 1000, () => {
      if (this.mode === 'chat') this.say(line, 2.4, 'freed');
    });
  }

  endChat() {
    this.partner = null;
    this.mode = 'idle';
    this.modeT = rand(0.5, 1.5);
  }

  releaseChat() {
    if (this.mode === 'await') {
      this.partner = null;
      this.mode = 'idle';
      this.modeT = rand(0.3, 1);
    }
  }

  pickMode() {
    const s = this.scene;
    this.stuckT = 0;
    this.lastPos.set(this.x, this.y);
    this.modeT = 0;
    this.partner = null;
    const r = Math.random();
    if (r < 0.42) {
      const f = s.claimFlower(this, 9 * TILE);
      if (f) {
        this.mode = 'walk';
        this.purpose = 'flower';
        this.target = f;
        return;
      }
    } else if (r < 0.75) {
      const p = s.findChatPartner(this);
      if (p) {
        p.mode = 'await';
        p.modeT = 7;
        p.partner = this;
        p.setVelocity(0, 0);
        this.partner = p;
        this.mode = 'walk';
        this.purpose = 'chat';
        this.target = { x: p.x, y: p.y };
        return;
      }
    }
    const t = s.randomWalkableNear(this.x, this.y, 5);
    if (t) {
      this.mode = 'walk';
      this.purpose = 'wander';
      this.target = t;
    } else {
      this.mode = 'idle';
      this.modeT = 1.5;
    }
  }
}
