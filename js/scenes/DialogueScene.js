import { FONT } from '../config.js';
import { Hero } from '../systems/Hero.js';
import { Sfx } from '../systems/Sfx.js';
import { buildPortrait } from '../art/portraits.js';
import { heroLook, heroKey } from '../art/sprites.js';
import { RELAPSE_LINES } from '../data/characters.js';

const BROWN = 0x5a3a1a;
const BROWN2 = 0x8a5a2b;
const PAPER = 0xf6e7c8;
const PAPER_DARK = 0xe6d0a4;
const INK = '#3a2a1a';
const PITCH = { bro: 0.8, influencer: 1.25, doom: 0.95 };

// Stardew-style conversation box with a portrait, name tag, typewriter text
// and one reply choice.
export class DialogueScene extends Phaser.Scene {
  constructor() {
    super('Dialogue');
  }

  create(data) {
    const W = this.scale.width;
    const H = this.scale.height;
    this.npc = data.npc;
    this.person = data.person;
    this.first = data.first;
    this.closing = false;
    const c = this.person.convo;

    // the script
    this.steps = [];
    if (this.first && data.relapse) {
      const pair = Phaser.Utils.Array.Shuffle(RELAPSE_LINES.slice()).slice(0, 2);
      pair.forEach(([f, t]) => this.steps.push({ face: f, text: t }));
    } else if (this.first) {
      c.lines.forEach(([f, t]) => this.steps.push({ face: f, text: t }));
      this.steps.push({ choice: c.choice });
      if (c.hint) this.steps.push({ face: c.hint[0], text: c.hint[1] });
    } else {
      const [f, t] = Phaser.Utils.Array.GetRandom(c.followup);
      this.steps.push({ face: f, text: t });
    }
    this.stepIdx = -1;

    this.add.rectangle(0, 0, W, H, 0x07050d, 0.35).setOrigin(0);
    const g = this.add.graphics();
    const panel = (x, y, w, h) => {
      g.fillStyle(BROWN).fillRect(x, y, w, h);
      g.fillStyle(BROWN2).fillRect(x + 5, y + 5, w - 10, h - 10);
      g.fillStyle(PAPER).fillRect(x + 10, y + 10, w - 20, h - 20);
      g.fillStyle(0xffffff, 0.35).fillRect(x + 10, y + 10, w - 20, 3);
    };
    panel(36, 318, 888, 206);
    // portrait frame
    g.fillStyle(BROWN).fillRect(56, 338, 166, 166);
    g.fillStyle(PAPER_DARK).fillRect(61, 343, 156, 156);
    this.portrait = this.add.image(139, 421, this.person.portrait, 'n').setScale(2.3);
    // name tag
    const nameText = this.add.text(0, 0, this.person.name.toUpperCase(), { fontFamily: FONT, fontSize: '15px', color: INK });
    const tagW = nameText.width + 36;
    panel(56, 278, tagW, 46);
    nameText.setPosition(56 + 18, 278 + 16);
    nameText.setDepth(1);

    this.textObj = this.add.text(244, 346, '', {
      fontFamily: FONT, fontSize: '15px', color: INK, lineSpacing: 12, wordWrap: { width: 650 },
    });
    this.arrow = this.add.triangle(892, 492, 0, 0, 16, 0, 8, 10, BROWN).setOrigin(0.5);
    this.tweens.add({ targets: this.arrow, y: 498, duration: 350, yoyo: true, repeat: -1 });

    // hero portrait (shown while choosing a reply)
    const profile = Hero.get();
    const hk = `pt_${heroKey(profile)}`;
    buildPortrait(this, hk, heroLook(profile), 'hero', 7);
    this.heroBox = this.add.container(0, 0).setVisible(false);
    const hg = this.add.graphics();
    hg.fillStyle(BROWN).fillRect(796, 168, 124, 124);
    hg.fillStyle(PAPER_DARK).fillRect(801, 173, 114, 114);
    const heroName = this.add.text(858, 150, profile.name.toUpperCase(), { fontFamily: FONT, fontSize: '12px', color: '#ffffff', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
    this.heroPortrait = this.add.image(858, 230, hk, 'n').setScale(1.7);
    this.heroBox.add([hg, this.heroPortrait, heroName]);

    this.choiceButtons = [];
    this.selected = 0;

    // input
    this.input.on('pointerdown', (ptr, over) => {
      if (over && over.length) return;
      this.advance();
    });
    const kb = this.input.keyboard;
    kb.on('keydown-SPACE', () => (this.choosing ? this.pickChoice(this.selected) : this.advance()));
    kb.on('keydown-ENTER', () => (this.choosing ? this.pickChoice(this.selected) : this.advance()));
    kb.on('keydown-J', () => (this.choosing ? this.pickChoice(this.selected) : this.advance()));
    kb.on('keydown-LEFT', () => this.moveSelection(-1));
    kb.on('keydown-RIGHT', () => this.moveSelection(1));
    kb.on('keydown-A', () => this.moveSelection(-1));
    kb.on('keydown-D', () => this.moveSelection(1));
    kb.on('keydown-ONE', () => this.choosing && this.pickChoice(0));
    kb.on('keydown-TWO', () => this.choosing && this.pickChoice(1));
    kb.on('keydown-ESC', () => this.close());

    this.readyAt = this.time.now + 200;
    this.nextStep();
  }

  nextStep() {
    this.stepIdx++;
    const step = this.steps[this.stepIdx];
    if (!step) {
      this.close();
      return;
    }
    if (step.choice) {
      this.showChoice(step.choice);
      return;
    }
    this.showLine(step.face, Hero.fill(step.text));
  }

  showLine(face, text) {
    this.choosing = false;
    this.portrait.setFrame(face === 'h' ? 'h' : 'n');
    this.portrait.setScale(2.4);
    this.tweens.add({ targets: this.portrait, scale: 2.3, duration: 160 });
    // pre-wrap so words don't jump lines while typing
    this.textObj.setWordWrapWidth(650);
    const wrapped = this.textObj.getWrappedText(text).join('\n');
    this.textObj.setWordWrapWidth(null);
    this.full = wrapped;
    this.shown = 0;
    this.typing = true;
    this.textObj.setText('');
    this.arrow.setVisible(false);
  }

  showChoice(options) {
    this.choosing = true;
    this.typing = false;
    this.readyAt = this.time.now + 500; // avoid picking a reply by accident while tapping through
    this.arrow.setVisible(false);
    this.heroBox.setVisible(true);
    this.selected = 0;
    this.choiceButtons = options.map((o, i) => {
      const x = 400 + i * 300;
      const y = 470;
      const c = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, 280, 50, PAPER_DARK).setStrokeStyle(4, BROWN);
      const t = this.add.text(0, 0, Hero.fill(o.label), { fontFamily: FONT, fontSize: '11px', color: INK, align: 'center', wordWrap: { width: 250 } }).setOrigin(0.5);
      c.add([bg, t]);
      c.bg = bg;
      c.setSize(280, 50).setInteractive({ useHandCursor: true });
      c.on('pointerover', () => this.setSelected(i));
      c.on('pointerup', () => this.pickChoice(i));
      return c;
    });
    this.setSelected(0);
  }

  setSelected(i) {
    this.selected = i;
    this.choiceButtons.forEach((b, j) => {
      b.bg.setFillStyle(j === i ? 0xffffff : PAPER_DARK);
      b.bg.setStrokeStyle(4, j === i ? 0xff8a3d : BROWN);
      b.setScale(j === i ? 1.04 : 1);
    });
  }

  moveSelection(d) {
    if (!this.choosing) return;
    this.setSelected((this.selected + d + this.choiceButtons.length) % this.choiceButtons.length);
    Sfx.play('click');
  }

  pickChoice(i) {
    if (!this.choosing || this.time.now < this.readyAt) return;
    const step = this.steps[this.stepIdx];
    const option = step.choice[i];
    Sfx.play('click');
    this.heroPortrait.setFrame('h');
    this.choiceButtons.forEach((b) => b.destroy());
    this.choiceButtons = [];
    this.choosing = false;
    this.time.delayedCall(250, () => this.heroBox.setVisible(false));
    // insert the reply lines right after the choice
    const reply = option.reply.map(([f, t]) => ({ face: f, text: t }));
    this.steps.splice(this.stepIdx + 1, 0, ...reply);
    this.nextStep();
  }

  advance() {
    if (this.closing || this.choosing || this.time.now < this.readyAt) return;
    if (this.typing) {
      this.shown = this.full.length;
      this.textObj.setText(this.full);
      this.typing = false;
      this.arrow.setVisible(true);
      return;
    }
    Sfx.play('click');
    this.nextStep();
  }

  close() {
    if (this.closing) return;
    this.closing = true;
    const game = this.scene.get('Game');
    this.scene.stop();
    game.onDialogueEnd(this.npc, this.first);
  }

  update(time, delta) {
    if (!this.typing) return;
    const before = Math.floor(this.shown);
    this.shown = Math.min(this.full.length, this.shown + (delta / 1000) * 48);
    const now = Math.floor(this.shown);
    if (now !== before) {
      this.textObj.setText(this.full.slice(0, now));
      if (now % 3 === 0 && this.full[now - 1] !== ' ') Sfx.play('blip', PITCH[this.person.kind] || 1);
    }
    if (this.shown >= this.full.length) {
      this.typing = false;
      this.arrow.setVisible(true);
    }
  }
}
