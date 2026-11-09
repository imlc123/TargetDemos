import { TUNING } from '../config.js';
import { buildHero, heroKey } from '../art/sprites.js';
import { Hero } from '../systems/Hero.js';

const { Vector2 } = Phaser.Math;

// The hero: phone-less, slingshot in hand, looks however the player chose.
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    const profile = Hero.get();
    buildHero(scene, profile);
    const key = heroKey(profile);
    super(scene, x, y, `${key}_color`, 'idle0');
    this.texKey = key;
    this.variant = 'color';
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.body.setSize(10, 6).setOffset(7, 26);

    this.facing = new Vector2(1, 0);
    this.shootCd = 0;
    this.parryCd = 0;
    this.stun = 0;
    this.knock = new Vector2();
    this.animT = 0;
    this.walkIdx = 0;
    this.idleIdx = 0;
    this.swingT = 0;
    this.shadow = scene.add.image(x, y, 'shadow').setDepth(4);

    this.keys = scene.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,J');
  }

  // Center of the body (for hit tests and aiming).
  get cx() {
    return this.x;
  }
  get cy() {
    return this.y - 13;
  }

  // The feed got you: gray, phone in hand.
  onboard() {
    this.variant = 'gray';
    this.setTexture(`${this.texKey}_gray`, 'idle0');
  }

  swing() {
    this.swingT = 0.25;
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
    this.swingT = Math.max(0, this.swingT - dt);

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
      if (len > 0.2) this.facing.set(mx, my).normalize();
    }

    if (this.facing.x < -0.1) this.setFlipX(true);
    else if (this.facing.x > 0.1) this.setFlipX(false);

    // animation
    const moving = this.body.velocity.lengthSq() > 30;
    this.animT += dt;
    let frame;
    if (this.swingT > 0) frame = 'wave';
    else if (moving) {
      if (this.animT > 0.1) { this.animT = 0; this.walkIdx = (this.walkIdx + 1) % 4; }
      frame = `walk${this.walkIdx}`;
    } else {
      if (this.animT > 0.5) { this.animT = 0; this.idleIdx ^= 1; }
      frame = `idle${this.idleIdx}`;
    }
    if (this.frame.name !== frame) this.setFrame(frame);

    // flicker during grace period
    const meter = this.scene.meter;
    this.setAlpha(meter && meter.invuln > 0 && Math.floor(meter.invuln * 14) % 2 ? 0.45 : 1);

    this.setDepth(100 + this.y);
    this.shadow.setPosition(this.x, this.y - 1);
  }
}
