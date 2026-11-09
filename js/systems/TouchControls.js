import { FONT } from '../config.js';

// Floating joystick on the left half of the screen, action area on the right.
// Writes into a shared state object: { x, y, action }.
export class TouchControls {
  constructor(scene, state) {
    this.scene = scene;
    this.state = state;
    this.W = scene.scale.width;
    this.H = scene.scale.height;
    this.radius = 48;
    this.joyId = null;
    this.enabled = !!scene.sys.game.device.input.touch;

    this.base = scene.add.circle(0, 0, this.radius, 0xffffff, 0.08).setStrokeStyle(3, 0xffffff, 0.35);
    this.knob = scene.add.circle(0, 0, 22, 0xffffff, 0.4);
    this.base.setVisible(false);
    this.knob.setVisible(false);

    const bx = this.W - 104;
    const by = this.H - 104;
    this.btn = scene.add.circle(bx, by, 60, 0xff5fa2, 0.22).setStrokeStyle(4, 0xffb3d6, 0.85);
    this.btnLabel = scene.add
      .text(bx, by, 'SHOOT', { fontFamily: FONT, fontSize: '13px', color: '#ffffff' })
      .setOrigin(0.5);
    this.hint = scene.add
      .text(28, this.H - 40, 'drag here to move', { fontFamily: FONT, fontSize: '11px', color: '#ffffff' })
      .setAlpha(0.45);

    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
    scene.input.on('pointerupoutside', this.onUp, this);
    this.applyVisible();
  }

  applyVisible() {
    this.btn.setVisible(this.enabled);
    this.btnLabel.setVisible(this.enabled);
    this.hint.setVisible(this.enabled && !this.usedJoystick);
  }

  blocked() {
    return this.scene.scene.isActive('Card') || this.scene.scene.isActive('Dialogue');
  }

  onDown(p, over) {
    if (over && over.length) return; // tapped a HUD button
    if (p.wasTouch && !this.enabled) {
      this.enabled = true;
      this.applyVisible();
    }
    if (!this.enabled || this.blocked()) return;
    if (p.x < this.W * 0.5) {
      if (this.joyId === null) {
        this.joyId = p.id;
        this.bx = p.x;
        this.by = p.y;
        this.base.setPosition(p.x, p.y).setVisible(true);
        this.knob.setPosition(p.x, p.y).setVisible(true);
        this.usedJoystick = true;
        this.hint.setVisible(false);
      }
    } else if (p.y > 100) {
      this.state.action = true;
      this.btn.setScale(0.9);
      this.scene.time.delayedCall(90, () => this.btn.setScale(1));
    }
  }

  onMove(p) {
    if (p.id !== this.joyId) return;
    let dx = p.x - this.bx;
    let dy = p.y - this.by;
    const len = Math.hypot(dx, dy);
    if (len > this.radius) {
      dx = (dx / len) * this.radius;
      dy = (dy / len) * this.radius;
    }
    this.knob.setPosition(this.bx + dx, this.by + dy);
    const nx = dx / this.radius;
    const ny = dy / this.radius;
    const mag = Math.hypot(nx, ny);
    if (mag < 0.18) {
      this.state.x = 0;
      this.state.y = 0;
    } else {
      this.state.x = nx;
      this.state.y = ny;
    }
  }

  onUp(p) {
    if (p.id !== this.joyId) return;
    this.joyId = null;
    this.state.x = 0;
    this.state.y = 0;
    this.base.setVisible(false);
    this.knob.setVisible(false);
  }

  update(game) {
    if (!this.enabled) return;
    const ready = !!game.parryReady;
    const talk = !ready && !!game.talkTarget;
    this.btnLabel.setText(ready ? 'DEFLECT!' : talk ? 'TALK' : 'SHOOT');
    this.btn.setFillStyle(ready ? 0xffe066 : talk ? 0x7bd36a : 0xff5fa2, ready || talk ? 0.45 : 0.22);
    if (this.blocked() && this.joyId !== null) this.onUp({ id: this.joyId });
  }

  destroy() {
    const i = this.scene.input;
    i.off('pointerdown', this.onDown, this);
    i.off('pointermove', this.onMove, this);
    i.off('pointerup', this.onUp, this);
    i.off('pointerupoutside', this.onUp, this);
  }
}
