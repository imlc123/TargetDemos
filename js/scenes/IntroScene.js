import { FONT } from '../config.js';
import { buildIntroTextures, ROOM_W, ROOM_H, WINDOW } from '../art/intro.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { makeButton } from '../ui/button.js';

const S = 4; // the room is drawn at 240x135 and shown 4x
const P = (x) => x * S;
const FEED = ['Trending: you', 'You might also like... more', '37 new notifications', 'Keep watching', 'Just one more', 'Your ad is ready', 'Recommended for you'];

// The opening: 3:47 AM, a dark bedroom, a slingshot through the window.
export class IntroScene extends Phaser.Scene {
  constructor() {
    super('Intro');
  }

  init(data) {
    this.next = data.next || 'menu';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    buildIntroTextures(this);
    this.finished = false;
    this.cameras.main.setBackgroundColor('#000000');

    // ----- world (the room) -----
    this.world = [];
    const add = (o) => { this.world.push(o); return o; };
    this.roomGray = add(this.add.image(0, 0, 'intro_room_gray').setOrigin(0).setScale(S));
    this.roomColor = add(this.add.image(0, 0, 'intro_room_color').setOrigin(0).setScale(S).setAlpha(0));
    // rain behind the window glass
    this.rain = add(this.add.particles(0, 0, 'raindrop', {
      x: { min: P(WINDOW.x), max: P(WINDOW.x + WINDOW.w) }, y: P(WINDOW.y), speedY: { min: 380, max: 460 }, speedX: -30,
      lifespan: 450, frequency: 25, scale: 2, alpha: 0.5,
    }));
    this.glass = add(this.add.image(0, 0, 'intro_glass').setOrigin(0).setScale(S).setVisible(false));
    this.lying = add(this.add.image(P(20), P(58), 'intro_lying').setOrigin(0).setScale(S));
    this.phone = add(this.add.image(P(36), P(54), 'intro_phone').setScale(S));
    this.faceGlow = add(this.add.image(P(32), P(64), 'glow').setScale(5).setTint(0x7fe3ff).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.8));
    this.dark = add(this.add.rectangle(0, 0, P(ROOM_W), P(ROOM_H), 0x05030c, 0.7).setOrigin(0));
    this.faceGlow.setDepth(5);
    this.phone.setDepth(6);
    this.lying.setDepth(4);
    this.dark.setDepth(3);
    this.sling = add(this.add.image(P(WINDOW.x + 30), P(WINDOW.y + 20), 'intro_sling').setScale(S).setVisible(false).setDepth(7));
    this.heroA = add(this.add.image(P(130), P(122), 'intro_hero_a_gray', 'idle0').setOrigin(0.5, 1).setScale(S).setVisible(false).setDepth(6));
    this.heroColor = add(this.add.image(P(130), P(122), 'intro_hero_a_color', 'idle0').setOrigin(0.5, 1).setScale(S).setAlpha(0).setDepth(6));
    this.shards = add(this.add.particles(0, 0, 'shard', {
      speed: { min: 150, max: 420 }, angle: { min: 120, max: 240 }, gravityY: 900, lifespan: 1200, scale: { start: 2.5, end: 1 },
      tint: [0xe8f6ff, 0xbfe8ff, 0xffffff], emitting: false,
    }).setDepth(8));
    this.sparkles = add(this.add.particles(0, 0, 'sparkle', {
      speed: { min: 30, max: 120 }, lifespan: 900, scale: { start: 3, end: 0 }, tint: [0xffe066, 0xff9fd0, 0x9fe8ff], emitting: false,
    }).setDepth(8));
    this.bubbles = [];

    // ----- screen layer (captions, note, skip) -----
    this.ui = [];
    const ui = (o) => { this.ui.push(o); return o; };
    this.bigCaption = ui(this.add.text(W / 2, H / 2, '', { fontFamily: FONT, fontSize: '40px', color: '#ff3b4e' }).setOrigin(0.5).setAlpha(0));
    this.caption = ui(this.add.text(W / 2, H - 46, '', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff', backgroundColor: '#000000aa', padding: { x: 14, y: 10 }, align: 'center',
    }).setOrigin(0.5).setAlpha(0));
    this.note = ui(this.add.container(W / 2, H / 2 - 20).setVisible(false));
    const paper = this.add.rectangle(0, 0, 420, 220, 0xf4efe0).setStrokeStyle(6, 0xc8c0b0);
    const lines = this.add.graphics();
    for (let y = -70; y < 100; y += 34) lines.fillStyle(0xd8e4f0).fillRect(-190, y, 380, 3);
    const ink = this.add.text(0, 0, 'LOOK UP.', { fontFamily: FONT, fontSize: '44px', color: '#2a2a4a' }).setOrigin(0.5).setAngle(-4);
    this.note.add([paper, lines, ink]).setAngle(3);
    this.title = ui(this.add.text(W / 2, H / 2, 'TARGET DEMOS', { fontFamily: FONT, fontSize: '48px', color: '#ff5fa2' }).setOrigin(0.5).setAlpha(0));
    this.skipBtn = ui(makeButton(this, W - 100, 34, 'SKIP >>', () => this.finish(), { w: 160, h: 40, size: 11, color: 0x8a5cff }));

    // two cameras: one for the room (zooms and pans), one fixed for captions
    this.uiCam = this.cameras.add(0, 0, W, H);
    this.uiCam.ignore(this.world);
    this.cameras.main.ignore(this.ui);
    this.cameras.main.setBounds(0, 0, P(ROOM_W), P(ROOM_H));

    const kb = this.input.keyboard;
    kb.on('keydown-SPACE', () => this.finish());
    kb.on('keydown-ENTER', () => this.finish());
    kb.on('keydown-ESC', () => this.finish());

    this.room = [this.roomGray, this.roomColor, this.glass, this.lying, this.phone, this.faceGlow, this.dark];
    this.room.forEach((o) => o.setAlpha(0));
    this.runTimeline();
  }

  // Adds a world-space object later (ignored by the caption camera).
  addWorld(o) {
    this.world.push(o);
    this.uiCam.ignore(o);
    return o;
  }

  say(text, hold = 2600) {
    this.caption.setText(text);
    this.tweens.killTweensOf(this.caption);
    this.caption.setAlpha(0);
    this.tweens.add({ targets: this.caption, alpha: 1, duration: 300 });
    this.tweens.add({ targets: this.caption, alpha: 0, delay: hold, duration: 400 });
  }

  at(ms, fn) {
    this.time.delayedCall(ms, () => { if (!this.finished) fn(); });
  }

  runTimeline() {
    const cam = this.cameras.main;

    // 1. black: 3:47 AM
    this.bigCaption.setText('3:47 AM');
    this.tweens.add({ targets: this.bigCaption, alpha: 1, duration: 600 });
    this.at(1700, () => this.tweens.add({ targets: this.bigCaption, alpha: 0, duration: 500 }));

    // 2. the dark bedroom, scrolling
    this.at(2200, () => {
      Sfx.rain(true);
      this.tweens.add({ targets: [this.roomGray, this.lying, this.phone], alpha: 1, duration: 1200 });
      this.tweens.add({ targets: this.dark, alpha: 0.7, duration: 1200 });
      this.tweens.add({ targets: this.faceGlow, alpha: 0.8, duration: 1200 });
      this.tweens.add({ targets: this.faceGlow, scale: 5.6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });
    this.feedTimer = this.time.addEvent({ delay: 750, startAt: 0, loop: true, callback: () => this.feedBubble(), paused: true });
    this.at(2800, () => { this.feedTimer.paused = false; });
    this.at(3400, () => this.say('The feed never ends.', 2600));
    this.at(6800, () => this.say('It always knows what you want next.', 2800));
    this.at(7200, () => {
      cam.pan(P(40), P(62), 3800, 'Sine.easeInOut');
      cam.zoomTo(2.2, 3800, 'Sine.easeInOut');
    });

    // 3. CRASH
    this.at(11400, () => this.crash());

    // 4. waking up
    this.at(13200, () => {
      this.lying.setTexture('intro_lying_startled');
      const bang = this.addWorld(this.add.text(P(30), P(50), '!', { fontFamily: FONT, fontSize: '28px', color: '#ffe066', stroke: '#000000', strokeThickness: 6 }).setOrigin(0.5).setDepth(9));
      this.tweens.add({ targets: bang, y: P(44), alpha: 0, delay: 600, duration: 600 });
      Sfx.play('pop');
    });
    this.at(14600, () => {
      this.lying.setVisible(false);
      this.heroA.setVisible(true).setY(P(110));
      this.tweens.add({ targets: [this.heroA, this.heroColor], y: P(122), duration: 380, ease: 'Bounce.Out' });
      this.heroColor.setY(P(110));
      Sfx.play('swoosh');
    });
    this.at(15600, () => this.say('...huh?', 1400));

    // 5. color washes over the room
    this.at(17000, () => {
      Sfx.play('chord');
      cam.flash(500, 255, 240, 210);
      this.tweens.add({ targets: this.roomColor, alpha: 1, duration: 1800 });
      this.tweens.add({ targets: this.dark, alpha: 0.12, duration: 1800 });
      this.tweens.add({ targets: this.heroColor, alpha: 1, duration: 1400 });
      this.sparkles.explode(30, this.heroA.x, this.heroA.y - P(16));
      this.rain.frequency = 120;
    });

    // 6. the note
    this.at(19200, () => {
      cam.pan(P(70), P(100), 900, 'Sine.easeInOut');
      this.say('Something is tied to it...', 1800);
    });
    this.at(20400, () => {
      this.note.setVisible(true).setScale(0.6).setAlpha(0);
      this.tweens.add({ targets: this.note, scale: 1, alpha: 1, duration: 350, ease: 'Back.Out' });
      Sfx.play('pop');
    });
    this.at(22600, () => this.tweens.add({ targets: this.note, alpha: 0, scale: 0.8, duration: 300 }));

    // 7. pick up the slingshot, head for the window
    this.at(23000, () => {
      cam.zoomTo(1.5, 900, 'Sine.easeInOut');
      this.walk(this.heroColor, P(70), 900, () => {
        this.sling.setVisible(false);
        this.heroColor.setTexture('intro_hero_b_color', 'wave');
        Sfx.play('freed');
        this.sparkles.explode(14, this.heroColor.x, this.heroColor.y - P(24));
        this.time.delayedCall(500, () => this.heroColor.setFrame('idle0'));
      });
      this.heroA.setVisible(false);
    });
    this.at(25000, () => {
      cam.pan(P(160), P(80), 1600, 'Sine.easeInOut');
      this.walk(this.heroColor, P(192), 1700);
    });
    this.at(25600, () => this.say('Outside, a whole city is still scrolling.', 2600));
    this.at(27200, () => {
      this.tweens.add({ targets: this.heroColor, y: P(WINDOW.y + WINDOW.h + 4), duration: 500, ease: 'Quad.Out' });
      this.tweens.add({ targets: this.heroColor, alpha: 0, scale: S * 0.6, delay: 600, duration: 700 });
      Sfx.play('swoosh');
    });

    // 8. title
    this.at(28600, () => {
      this.tweens.add({ targets: this.room.concat([this.heroColor, this.sling]), alpha: 0, duration: 900 });
      this.rain.stop();
      Sfx.rain(false);
    });
    this.at(29400, () => {
      this.tweens.add({ targets: this.title, alpha: 1, duration: 800 });
      Sfx.play('clear');
    });
    this.at(31600, () => this.finish());
  }

  walk(obj, toX, dur, done) {
    let f = 0;
    const ev = this.time.addEvent({ delay: 120, loop: true, callback: () => { f = (f + 1) % 4; obj.setFrame(`walk${f}`); } });
    obj.setFlipX(toX < obj.x);
    this.tweens.add({
      targets: obj, x: toX, duration: dur, ease: 'Linear',
      onComplete: () => { ev.remove(); obj.setFrame('idle0'); if (done) done(); },
    });
  }

  feedBubble() {
    const t = Phaser.Utils.Array.GetRandom(FEED);
    const b = this.addWorld(this.add.text(this.phone.x + Phaser.Math.Between(-30, 50), this.phone.y - 10, t, {
      fontFamily: FONT, fontSize: '9px', color: '#9fe8ff', backgroundColor: '#161626', padding: { x: 4, y: 3 }, resolution: 2,
    }).setOrigin(0.5, 1).setDepth(9).setAlpha(0));
    this.bubbles.push(b);
    this.tweens.add({ targets: b, alpha: 1, duration: 200 });
    this.tweens.add({ targets: b, y: b.y - 90, duration: 2600, ease: 'Sine.Out' });
    this.tweens.add({ targets: b, alpha: 0, delay: 1900, duration: 600, onComplete: () => b.destroy() });
    Sfx.play('ping');
  }

  crash() {
    const cam = this.cameras.main;
    this.feedTimer.remove();
    this.bubbles.forEach((b) => b.active && this.tweens.add({ targets: b, scale: 0, alpha: 0, duration: 150 }));
    this.glass.setVisible(true).setAlpha(1);
    this.shards.explode(40, P(WINDOW.x + 38), P(WINDOW.y + 24));
    Sfx.play('crash');
    cam.shake(400, 0.012);
    cam.zoomTo(1.2, 400, 'Quad.easeOut');
    cam.pan(P(90), P(70), 400, 'Quad.easeOut');
    // the slingshot flies in and knocks the phone away
    this.sling.setVisible(true).setPosition(P(WINDOW.x + 30), P(WINDOW.y + 20));
    this.tweens.add({ targets: this.sling, x: this.phone.x, y: this.phone.y, angle: -720, duration: 330, ease: 'Quad.In', onComplete: () => {
      Sfx.play('thud2');
      this.tweens.killTweensOf(this.faceGlow);
      this.tweens.add({ targets: this.faceGlow, alpha: 0, duration: 250 });
      this.tweens.add({ targets: this.dark, alpha: 0.82, duration: 250 });
      // phone bonks off the wall and drops
      this.tweens.add({ targets: this.phone, x: P(6), y: P(36), angle: -400, duration: 260, ease: 'Quad.Out', onComplete: () => {
        this.phone.setTexture('intro_phone_cracked');
        Sfx.play('thud');
        this.tweens.add({ targets: this.phone, y: P(118), x: P(10), angle: -450, duration: 420, ease: 'Bounce.Out' });
      } });
      // slingshot clatters to the floor by the bed
      this.tweens.add({ targets: this.sling, x: P(70), y: P(116), angle: -770, duration: 600, ease: 'Bounce.Out' });
    } });
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    Sfx.rain(false);
    Save.setSeenIntro();
    if (this.next === 'create') this.scene.start('Create', { next: 'game', level: 0 });
    else this.scene.start('Menu');
  }
}
