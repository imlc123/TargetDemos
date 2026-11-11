// The Algorithm meter: fills when the feed gets its hooks in you.
// Full meter = you get a phone and the level restarts.

export class AlgorithmMeter {
  constructor(cfg) {
    this.cfg = cfg;
    this.value = 0;
    this.sinceRise = 99;
    this.invuln = 0;
    this.flash = 0;
    this.frozen = false;
    this.scale = 1; // the level's difficulty: scales everything that fills the meter
  }

  // Calming down (tea, benches, chats).
  calm(amount) {
    this.value = Math.max(0, this.value - amount);
  }

  // Steady drain from auras and cameras. No grace period.
  addContinuous(amount) {
    if (this.frozen) return;
    this.value = Math.min(this.cfg.max, this.value + amount * this.scale);
    this.sinceRise = 0;
  }

  // A single hit. Returns false if still in the grace period.
  hit(amount) {
    if (this.frozen || this.invuln > 0) return false;
    this.value = Math.min(this.cfg.max, this.value + amount * this.scale);
    this.sinceRise = 0;
    this.invuln = this.cfg.invulnTime;
    this.flash = 0.4;
    return true;
  }

  update(dt) {
    this.invuln = Math.max(0, this.invuln - dt);
    this.flash = Math.max(0, this.flash - dt);
    this.sinceRise += dt;
    if (!this.frozen && !this.full && this.sinceRise > this.cfg.drainDelay) {
      this.value = Math.max(0, this.value - this.cfg.drainPerSec * dt);
    }
  }

  get ratio() {
    return this.value / this.cfg.max;
  }

  get full() {
    return this.value >= this.cfg.max;
  }
}
