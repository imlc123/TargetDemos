import { TUNING } from '../config.js';
import { buildHero, heroKey, facingFor, HAND_AT, PHONE_AT } from '../art/sprites.js';
import { Hero } from '../systems/Hero.js';

const { Vector2 } = Phaser.Math;

// The hero: phone-less, slingshot in hand, looks however the player chose.
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    const profile = Hero.get();
    buildHero(scene, profile);
    const key = heroKey(profile);
    super(scene, x, y, `${key}_color`, 'down_idle0');
    this.texKey = key;
    this.variant = 'color';
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.body.setSize(10, 6).setOffset(7, 26);

    this.facing = new Vector2(0, 1); // aim/move direction (unit vector)
    this.look = { facing: 'down', flip: false }; // sprite facing
    this.shootCd = 0;
    this.parryCd = 0;
    this.stun = 0;
    this.knock = new Vector2();
    this.animT = 0;
    this.walkIdx = 0;
    this.idleIdx = 0;
    this.aimT = 0;
    this.aimDir = new Vector2(0, 1);
    this.shadow = scene.add.image(x, y, 'shadow').setDepth(4);
    this.sling = scene.add.image(x, y, 'slingshot', 'held').setOrigin(0.5, 0.8);

    this.keys = scene.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,J');
  }

  // Center of the body (for hit tests and aiming).
  get cx() {
    return this.x;
  }
  get cy() {
    return this.y - 13;
  }

  // The feed got you: gray, phone in hand, slingshot dropped.
  onboard() {
    this.variant = 'gray';
    this.setTexture(`${this.texKey}_gray`, `${this.look.facing}_idle0`);
    this.sling.setVisible(false);
  }

  // Where the phone sits when onboarded (world coords).
  phonePos() {
    const at = PHONE_AT[this.look.facing].phone || PHONE_AT.down.phone;
    const px = this.look.flip ? 23 - at[0] : at[0];
    return { x: this.x - 12 + px + 0.5, y: this.y - 32 + at[1] + 0.5 };
  }

  // Raise the slingshot toward (dx, dy): pull back, then release.
  aim(dx, dy) {
    this.aimDir.set(dx, dy).normalize();
    this.facing.copy(this.aimDir);
    this.look = facingFor(dx, dy, this.look);
    this.aimT = 0.3;
  }

  consumeAction() {
    const K = Phaser.Input.Keyboard.JustDown;
    let pressed = K(this.keys.SPACE) || K(this.keys.J);
    const touch = this.scene.registry.get('touch');
    if (touch && touch.action) {
      touch.action = false;
      pressed = true;
    }
    return pressed && this.stun <= 0;
  }

  // Knocked back and dazed (filmed, shoved).
  stagger(fromX, fromY, power, time) {
    const v = new Vector2(this.x - fromX, this.y - fromY);
    if (v.lengthSq() < 0.01) v.set(0, 1);
    v.normalize().scale(power);
    this.knock.copy(v);
    this.stun = Math.max(this.stun, time);
  }

  update(dt) {
    this.shootCd = Math.max(0, this.shootCd - dt);
    this.parryCd = Math.max(0, this.parryCd - dt);
    this.aimT = Math.max(0, this.aimT - dt);

    let mx = 0;
    let my = 0;
    const k = this.keys;
    if (k.A.isDown || k.LEFT.isDown) mx -= 1;
    if (k.D.isDown || k.RIGHT.isDown) mx += 1;
    if (k.W.isDown || k.UP.isDown) my -= 1;
    if (k.S.isDown || k.DOWN.isDown) my += 1;
    const touch = this.scene.registry.get('touch');
    if (touch && (touch.x || touch.y)) {
      mx = touch.x;
      my = touch.y;
    }
    let len = Math.hypot(mx, my);
    if (len > 1) {
      mx /= len;
      my /= len;
      len = 1;
    }

    if (this.stun > 0) {
      this.stun -= dt;
      this.setVelocity(this.knock.x, this.knock.y);
      this.knock.scale(Math.pow(0.02, dt));
      if (this.variant === 'color') this.setTint(Math.floor(this.stun * 12) % 2 ? 0xffffff : 0xff9fd0);
    } else {
      this.clearTint();
      const speed = TUNING.player.speed;
      this.setVelocity(mx * speed, my * speed);
      if (len > 0.2) {
        this.facing.set(mx, my).normalize();
        if (this.aimT <= 0) this.look = facingFor(mx, my, this.look);
      }
    }
    this.setFlipX(this.look.facing === 'side' && this.look.flip);

    // animation
    const f = this.look.facing;
    const moving = this.body.velocity.lengthSq() > 30;
    this.animT += dt;
    let frame;
    if (this.aimT > 0) frame = `${f}_aim`;
    else if (moving) {
      if (this.animT > 0.1) { this.animT = 0; this.walkIdx = (this.walkIdx + 1) % 4; }
      frame = `${f}_walk${this.walkIdx}`;
    } else {
      if (this.animT > 0.5) { this.animT = 0; this.idleIdx ^= 1; }
      frame = `${f}_idle${this.idleIdx}`;
    }
    if (this.frame.name !== frame) this.setFrame(frame);

    // flicker during grace period
    const meter = this.scene.meter;
    const alpha = meter && meter.invuln > 0 && Math.floor(meter.invuln * 14) % 2 ? 0.45 : 1;
    this.setAlpha(alpha);

    const depth = 100 + this.y;
    this.setDepth(depth);
    this.shadow.setPosition(this.x, this.y - 1);
    this.updateSling(frame, depth, alpha);
  }

  updateSling(frame, depth, alpha) {
    if (this.variant !== 'color') return;
    const f = this.look.facing;
    const flip = this.look.flip && f === 'side';
    const aiming = this.aimT > 0;
    let [hx, hy] = HAND_AT[f][aiming ? 'aim' : 'rest'];
    if (!aiming) {
      // follow the swinging hand
      const anim = frame.split('_')[1];
      if (f === 'side') hx += { walk0: 2, walk2: -2 }[anim] || 0;
      else hy += { walk1: -1, walk3: 1 }[anim] || 0;
      if (anim === 'idle1' || anim === 'walk1' || anim === 'walk3') hy += 1;
    }
    const px = flip ? 23 - hx : hx;
    this.sling.setPosition(this.x - 12 + px + 0.5, this.y - 32 + hy + 0.5).setAlpha(alpha);
    if (aiming) {
      this.sling.setFrame(this.aimT > 0.18 ? 'drawn' : 'release');
      this.sling.setRotation(Math.atan2(this.aimDir.y, this.aimDir.x) + Math.PI / 2);
      this.sling.setDepth(f === 'up' ? depth - 0.5 : depth + 0.5);
    } else {
      this.sling.setFrame('held');
      this.sling.setRotation(f === 'side' ? (flip ? -2.6 : 2.6) : 2.9);
      this.sling.setDepth(f === 'up' ? depth - 0.5 : depth + 0.5);
    }
  }
}
