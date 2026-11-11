import { FONT } from '../config.js';
import { buildIntroTextures, ROOM_W, ROOM_H, WINDOW } from '../art/intro.js';
import { buildIntroPanels, PANEL_W, PANEL_H } from '../art/introPanels.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { makeButton } from '../ui/button.js';

const S = 4; // the room is drawn at 240x135 and shown 4x
const P = (x) => x * S;
const FEED = ['Trending: you', 'You might also like... more', '37 new notifications', 'Keep watching', 'Just one more', 'Your ad is ready', 'Recommended for you'];

// The opening: 3:47 AM, a dark bedroom, a slingshot through the window.
// Wide shots of the room are mixed with comic-style close-up panels.
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
    buildIntroPanels(this);
    this.finished = false;
    this.cameras.main.setBackgroundColor('#000000');

    // ----- world (the room) -----
    this.world = [];
    const add = (o) => { this.world.push(o); return o; };
    this.roomGray = add(this.add.image(0, 0, 'intro_room_gray').setOrigin(0).setScale(S));
    this.roomColor = add(this.add.image(0, 0, 'intro_room_color').setOrigin(0).setScale(S).setAlpha(0));
    this.rain = add(this.add.particles(0, 0, 'raindrop', {
      x: { min: P(WINDOW.x), max: P(WINDOW.x + WINDOW.w) }, y: P(WINDOW.y), speedY: { min: 380, max: 460 }, speedX: -30,
      lifespan: 450, frequency: 25, scale: 2, alpha: 0.5,
    }));
    this.glass = add(this.add.image(0, 0, 'intro_glass').setOrigin(0).setScale(S).setVisible(false));
    this.lying = add(this.add.image(P(21), P(62), 'intro_lying').setOrigin(0).setScale(S).setDepth(4));
    this.phone = add(this.add.image(P(44), P(58), 'intro_phone').setScale(S * 1.3).setDepth(6));
    this.faceGlow = add(this.add.image(P(40), P(64), 'glow').setScale(3.4).setTint(0x7fe3ff).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.55).setDepth(5));
    this.dark = add(this.add.rectangle(0, 0, P(ROOM_W), P(ROOM_H), 0x05030c, 0.7).setOrigin(0).setDepth(3));
    this.sling = add(this.add.image(P(WINDOW.x + 30), P(WINDOW.y + 20), 'intro_sling').setScale(S).setVisible(false).setDepth(7));
    this.heroA = add(this.add.image(P(132), P(122), 'intro_hero_a_gray', 'down_idle0').setOrigin(0.5, 1).setScale(S).setVisible(false).setDepth(6));
    this.heroColor = add(this.add.image(P(132), P(122), 'intro_hero_a_color', 'down_idle0').setOrigin(0.5, 1).setScale(S).setAlpha(0).setDepth(6));
    this.shards = add(this.add.particles(0, 0, 'shard', {
      speed: { min: 150, max: 420 }, angle: { min: 120, max: 240 }, gravityY: 900, lifespan: 1200, scale: { start: 2.5, end: 1 },
      tint: [0xe8f6ff, 0xbfe8ff, 0xffffff], emitting: false,
    }).setDepth(8));
    this.sparkles = add(this.add.particles(0, 0, 'sparkle', {
      speed: { min: 30, max: 120 }, lifespan: 900, scale: { start: 3, end: 0 }, tint: [0xffe066, 0xff9fd0, 0x9fe8ff], emitting: false,
    }).setDepth(8));
    this.bubbles = [];

    // ----- screen layer (captions, panels, skip) -----
    this.ui = [];
    const ui = (o) => { this.ui.push(o); return o; };
    this.bigCaption = ui(this.add.text(W / 2, H / 2, '', { fontFamily: FONT, fontSize: '40px', color: '#ff3b4e' }).setOrigin(0.5).setAlpha(0).setDepth(20));
    this.caption = ui(this.add.text(W / 2, H - 40, '', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff', backgroundColor: '#000000cc', padding: { x: 14, y: 10 }, align: 'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(30));
    this.panel = ui(this.add.container(W / 2, H / 2 - 16).setVisible(false).setDepth(10));
    const frame = this.add.graphics();
    frame.fillStyle(0x000000).fillRect(-PANEL_W * 2 - 14, -PANEL_H * 2 - 14, PANEL_W * 4 + 28, PANEL_H * 4 + 28);
    frame.fillStyle(0xffffff).fillRect(-PANEL_W * 2 - 9, -PANEL_H * 2 - 9, PANEL_W * 4 + 18, PANEL_H * 4 + 18);
    this.panelImg = this.add.image(0, 0, 'cu_phone').setScale(4);
    this.panelImg2 = this.add.image(0, 0, 'cu_eyes_color').setScale(4).setAlpha(0);
    this.feed = this.add.tileSprite((49 - PANEL_W / 2) * 4, (14 - PANEL_H / 2) * 4, 22, 40, 'cu_feed').setOrigin(0).setScale(4);
    this.sfxText = this.add.text(150, -110, '', { fontFamily: FONT, fontSize: '40px', color: '#ffe066', stroke: '#000000', strokeThickness: 10 }).setOrigin(0.5).setAngle(-8);
    this.panel.add([frame, this.panelImg, this.panelImg2, this.feed, this.sfxText]);
    this.title = ui(this.add.text(W / 2, H / 2, 'TARGET DEMOS', { fontFamily: FONT, fontSize: '48px', color: '#ff5fa2' }).setOrigin(0.5).setAlpha(0).setDepth(20));
    this.skipBtn = ui(makeButton(this, W - 100, 34, 'SKIP >>', () => this.finish(), { w: 160, h: 40, size: 11, color: 0x8a5cff }).setDepth(40));

    // two cameras: one for the room (zooms and pans), one fixed for captions and panels
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

  // Slide a close-up panel in from the side.
  showPanel(key, { feed = false, from = 1, sfx = '' } = {}) {
    this.tweens.killTweensOf(this.panel);
    this.panelImg.setTexture(key);
    this.panelImg2.setAlpha(0);
    this.feed.setVisible(feed);
    this.sfxText.setText(sfx).setScale(sfx ? 0.4 : 1);
    if (sfx) this.tweens.add({ targets: this.sfxText, scale: 1, duration: 250, ease: 'Back.Out' });
    const W = this.scale.width;
    this.panel.setVisible(true).setAlpha(1).setX(W / 2 + from * W).setAngle(from * 2);
    this.tweens.add({ targets: this.panel, x: W / 2, angle: from * -1.2, duration: 380, ease: 'Back.Out' });
  }

  swapPanel(key, sfx) {
    this.panelImg.setTexture(key);
    if (sfx !== undefined) {
      this.sfxText.setText(sfx).setScale(0.4);
      this.tweens.add({ targets: this.sfxText, scale: 1, duration: 220, ease: 'Back.Out' });
    }
    this.cameras.main.shake(150, 0.004);
  }

  hidePanel() {
    this.tweens.add({ targets: this.panel, alpha: 0, y: this.panel.y + 30, duration: 260, onComplete: () => { this.panel.setVisible(false).setY(this.scale.height / 2 - 16); } });
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
      this.tweens.add({ targets: this.faceGlow, alpha: 0.55, duration: 1200 });
      this.tweens.add({ targets: this.faceGlow, scale: 3.8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      cam.zoomTo(1.6, 2500, 'Sine.easeInOut');
      cam.pan(P(60), P(70), 2500, 'Sine.easeInOut');
    });
    this.feedTimer = this.time.addEvent({ delay: 750, loop: true, callback: () => this.feedBubble(), paused: true });
    this.at(2800, () => { this.feedTimer.paused = false; });
    this.at(3600, () => this.say('The feed never ends.', 2200));

    // close-up: the phone, scrolling forever
    this.at(5000, () => { this.showPanel('cu_phone', { feed: true }); Sfx.play('ping'); });
    this.at(6200, () => this.say('It always knows what you want next.', 2400));
    this.at(8600, () => this.hidePanel());

    // close-up: tired eyes full of screen
    this.at(9100, () => {
      cam.zoomTo(2.4, 1600, 'Sine.easeInOut');
      cam.pan(P(36), P(70), 1600, 'Sine.easeInOut');
    });
    this.at(9800, () => this.showPanel('cu_eyes_tired', { from: -1 }));
    this.at(11400, () => this.hidePanel());

    // 3. CRASH (slow motion, in panels)
    this.at(11900, () => {
      this.feedTimer.remove();
      this.showPanel('cu_window_a', { sfx: '' });
      Sfx.play('swoosh');
    });
    this.at(12700, () => {
      this.swapPanel('cu_window_b', 'CRASH!');
      Sfx.play('crash');
      this.cameras.main.flash(120, 255, 255, 255);
      this.glass.setVisible(true).setAlpha(1);
      this.shards.explode(40, P(WINDOW.x + 38), P(WINDOW.y + 24));
    });
    this.at(13900, () => this.swapPanel('cu_hit_a', 'WHACK!'));
    this.at(13950, () => Sfx.play('thud2'));
    this.at(14800, () => this.swapPanel('cu_hit_b', ''));
    this.at(16000, () => { this.hidePanel(); this.crashInRoom(); });

    // 4. waking up
    this.at(17500, () => {
      this.lying.setTexture('intro_lying_startled');
      const bang = this.addWorld(this.add.text(P(30), P(52), '!', { fontFamily: FONT, fontSize: '28px', color: '#ffe066', stroke: '#000000', strokeThickness: 6 }).setOrigin(0.5).setDepth(9));
      this.tweens.add({ targets: bang, y: P(46), alpha: 0, delay: 600, duration: 600 });
      Sfx.play('pop');
    });
    // close-up: eyes snap open, then the color comes back
    this.at(18300, () => this.showPanel('cu_eyes_wide', { from: 1 }));
    this.at(19300, () => {
      this.panelImg2.setTexture('cu_eyes_color');
      this.tweens.add({ targets: this.panelImg2, alpha: 1, duration: 1300 });
      Sfx.play('chord');
    });
    this.at(21200, () => this.hidePanel());

    this.at(21500, () => {
      this.lying.setVisible(false);
      this.heroA.setVisible(true).setY(P(110));
      this.heroColor.setY(P(110));
      this.tweens.add({ targets: [this.heroA, this.heroColor], y: P(122), duration: 380, ease: 'Bounce.Out' });
      Sfx.play('swoosh');
      cam.zoomTo(1.4, 900, 'Sine.easeInOut');
      cam.pan(P(110), P(90), 900, 'Sine.easeInOut');
    });

    // 5. color washes over the room
    this.at(22400, () => {
      cam.flash(500, 255, 240, 210);
      this.tweens.add({ targets: this.roomColor, alpha: 1, duration: 1800 });
      this.tweens.add({ targets: this.dark, alpha: 0.12, duration: 1800 });
      this.tweens.add({ targets: this.heroColor, alpha: 1, duration: 1400 });
      this.sparkles.explode(30, this.heroA.x, this.heroA.y - P(16));
      this.rain.frequency = 120;
    });

    // 6. the note
    this.at(24400, () => {
      cam.pan(P(70), P(100), 900, 'Sine.easeInOut');
      this.say('Something is tied to it...', 1800);
    });
    this.at(25600, () => { this.showPanel('cu_note', { from: -1 }); Sfx.play('pop'); });
    this.at(27900, () => this.hidePanel());

    // 7. pick up the slingshot, head for the window
    this.at(28300, () => {
      this.heroA.setVisible(false);
      this.walk(this.heroColor, P(70), 900, () => {
        this.sling.setVisible(false);
        this.heroColor.setTexture('intro_hero_b_color', 'wave');
        Sfx.play('freed');
        this.sparkles.explode(14, this.heroColor.x, this.heroColor.y - P(24));
        this.time.delayedCall(500, () => this.heroColor.setFrame('down_idle0'));
      });
    });
    this.at(30300, () => {
      cam.pan(P(160), P(80), 1600, 'Sine.easeInOut');
      this.walk(this.heroColor, P(192), 1700);
    });
    this.at(30900, () => this.say('Outside, a whole city is still scrolling.', 2600));
    this.at(32500, () => {
      this.heroColor.setFrame('up_idle0');
      this.tweens.add({ targets: this.heroColor, y: P(WINDOW.y + WINDOW.h + 4), duration: 500, ease: 'Quad.Out' });
      this.tweens.add({ targets: this.heroColor, alpha: 0, scale: S * 0.6, delay: 600, duration: 700 });
      Sfx.play('swoosh');
    });

    // 8. title
    this.at(33900, () => {
      this.tweens.add({ targets: this.room.concat([this.heroColor, this.sling]), alpha: 0, duration: 900 });
      this.rain.stop();
      Sfx.rain(false);
    });
    this.at(34700, () => {
      this.tweens.add({ targets: this.title, alpha: 1, duration: 800 });
      Sfx.play('clear');
    });
    this.at(36900, () => this.finish());
  }

  walk(obj, toX, dur, done) {
    let f = 0;
    const ev = this.time.addEvent({ delay: 120, loop: true, callback: () => { f = (f + 1) % 4; obj.setFrame(`side_walk${f}`); } });
    obj.setFlipX(toX < obj.x);
    this.tweens.add({
      targets: obj, x: toX, duration: dur, ease: 'Linear',
      onComplete: () => { ev.remove(); obj.setFlipX(false); obj.setFrame('down_idle0'); if (done) done(); },
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

  // Back to the wide shot: the phone flies into the wall, the slingshot lands on the floor.
  crashInRoom() {
    const cam = this.cameras.main;
    this.bubbles.forEach((b) => b.active && this.tweens.add({ targets: b, scale: 0, alpha: 0, duration: 150 }));
    cam.zoomTo(1.2, 400, 'Quad.easeOut');
    cam.pan(P(70), P(75), 400, 'Quad.easeOut');
    this.tweens.killTweensOf(this.faceGlow);
    this.tweens.add({ targets: this.faceGlow, alpha: 0, duration: 250 });
    this.tweens.add({ targets: this.dark, alpha: 0.82, duration: 250 });
    this.tweens.add({ targets: this.phone, x: P(6), y: P(36), angle: -400, duration: 260, ease: 'Quad.Out', onComplete: () => {
      this.phone.setTexture('intro_phone_cracked');
      Sfx.play('thud');
      this.tweens.add({ targets: this.phone, y: P(118), x: P(10), angle: -450, duration: 420, ease: 'Bounce.Out' });
    } });
    this.sling.setVisible(true).setPosition(P(40), P(58));
    this.tweens.add({ targets: this.sling, x: P(70), y: P(116), angle: -500, duration: 600, ease: 'Bounce.Out' });
  }

  update(time, delta) {
    if (this.feed.visible) this.feed.tilePositionY += delta * 0.012;
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
