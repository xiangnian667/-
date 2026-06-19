/* ===== 游戏主引擎 ===== */

import type { GameState, MechaState, InputState, GameMode, MapType } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  MECHA_WIDTH,
  MECHA_HEIGHT,
  ROUND_REST,
  EP_MAX,
  AIR_ATTACK_RANGE,
} from './constants';
import { createMecha, updateMecha, triggerDash, triggerLightAttack, triggerHeavyAttack, triggerSkill, triggerJump, triggerAirAttack } from './entities/mecha';
import { checkAttackHit } from './systems/combat';
import { updateParticles, spawnSkillParticles, spawnAmbientParticle, spawnGroundImpact } from './systems/particles';
import { checkRoundEnd, startNewRound, handleRoundEnd } from './systems/round';
import { render } from './renderer/index';
import { getInputState, clearJustPressed, setExternalInput, resetExternalInput } from './input';
import { updateParallax } from './renderer/scene';
import { initInput } from './input';
import { AIController } from './systems/ai';

export function createInitialState(mode: GameMode = 'pvp', mapType: MapType = 'city'): GameState {
  const p1StartX = CANVAS_WIDTH * 0.25 - MECHA_WIDTH / 2;
  const p2StartX = CANVAS_WIDTH * 0.75 - MECHA_WIDTH / 2;

  return {
    phase: 'countdown',
    mode,
    mapType,
    p1: createMecha('p1', p1StartX, 'red'),
    p2: createMecha('p2', p2StartX, 'blue'),
    particles: [],
    damageNumbers: [],
    screenShake: { intensity: 0, timer: 0 },
    screenFlash: { alpha: 0, timer: 0, color: '#ffffff' },
    timer: 99,
    countdown: 3,
    roundWinner: null,
    gameWinner: null,
    paused: false,
  };
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private animFrameId: number = 0;
  private lastTime: number = 0;
  private running: boolean = false;
  private roundEndTimer: number = 0;
  private parallaxAccum: number = 0;
  private ambientParticleTimer: number = 0;
  private onStateChange: ((state: GameState) => void) | null = null;
  private mode: GameMode = 'pvp';
  private mapType: MapType = 'city';
  private ai: AIController | null = null;

  constructor(canvas: HTMLCanvasElement, mode: GameMode = 'pvp', mapType: MapType = 'city') {
    this.canvas = canvas;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.state = createInitialState(mode, mapType);
    this.mode = mode;
    this.mapType = mapType;
    if (mode === 'pve') {
      this.ai = new AIController('hard');
    }
    initInput();
  }

  setOnStateChange(cb: (state: GameState) => void): void {
    this.onStateChange = cb;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.animFrameId);
  }

  getState(): GameState {
    return this.state;
  }

  startNewGame(): void {
    this.state = createInitialState(this.mode, this.mapType);
    this.state.phase = 'countdown';
    this.state.countdown = 3;
    this.roundEndTimer = 0;
    if (this.ai) {
      this.ai.reset();
    }
    // 重置外部输入
    resetExternalInput('p1');
    resetExternalInput('p2');
  }

  private loop = (time: number): void => {
    if (!this.running) return;

    const rawDt = (time - this.lastTime) / 1000;
    const dt = Math.min(rawDt, 0.05); // 防止大帧跳跃
    this.lastTime = time;

    this.update(dt, time);
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number, time: number): void {
    const s = this.state;

    // 暂停
    if (s.paused) {
      clearJustPressed();
      return;
    }

    // 视差更新
    this.parallaxAccum += dt * 15;
    updateParallax(this.parallaxAccum);

    switch (s.phase) {
      case 'countdown':
        this.updateCountdown(dt);
        break;
      case 'battle':
        this.updateBattle(dt, time);
        break;
      case 'round_end':
        this.updateRoundEnd(dt);
        break;
    }
  }

  private updateCountdown(dt: number): void {
    this.state.countdown -= dt;
    if (this.state.countdown <= 0) {
      this.state.phase = 'battle';
      this.state.countdown = 0;
    }
  }

  private updateBattle(dt: number, time: number): void {
    const s = this.state;

    // 计时器
    s.timer = Math.max(0, s.timer - dt);

    // 屏幕震动
    if (s.screenShake.timer > 0) s.screenShake.timer -= dt;
    if (s.screenFlash.timer > 0) s.screenFlash.timer -= dt;

    // 背景粒子
    this.ambientParticleTimer += dt;
    if (this.ambientParticleTimer > 0.5) {
      this.ambientParticleTimer = 0;
      s.particles.push(spawnAmbientParticle(CANVAS_WIDTH, CANVAS_HEIGHT));
    }

    // 读取输入
    const p1Input = getInputState('p1');
    const p2Input = this.mode === 'pve' && this.ai
      ? this.ai.update(s.p2, s.p1, dt)
      : getInputState('p2');

    // 冲刺检测
    this.handleDash(s.p1, p1Input, time);
    this.handleDash(s.p2, p2Input, time);

    // 攻击（空中轻攻自动变为下落攻击）
    if (p1Input.lightAttack) triggerLightAttack(s.p1);
    if (p1Input.heavyAttack) triggerHeavyAttack(s.p1);
    if (p1Input.heavyAttack && s.p1.ep >= 40) triggerSkill(s.p1);
    if (p2Input.lightAttack) triggerLightAttack(s.p2);
    if (p2Input.heavyAttack) triggerHeavyAttack(s.p2);
    if (p2Input.heavyAttack && s.p2.ep >= 40) triggerSkill(s.p2);

    // 跳跃
    if (p1Input.jump) {
      if (s.p1.isJumping) {
        if (s.p1.jumpCount < s.p1.maxJumps && !s.p1.isSlamming) {
          triggerJump(s.p1);
        } else {
          triggerAirAttack(s.p1);
        }
      } else {
        triggerJump(s.p1);
      }
    }
    if (p2Input.jump) {
      if (s.p2.isJumping) {
        if (s.p2.jumpCount < s.p2.maxJumps && !s.p2.isSlamming) {
          triggerJump(s.p2);
        } else {
          triggerAirAttack(s.p2);
        }
      } else {
        triggerJump(s.p2);
      }
    }

    // 更新机甲（记录下落攻击状态用于地面冲击特效）
    const p1WasSlamming = s.p1.isSlamming;
    const p2WasSlamming = s.p2.isSlamming;
    updateMecha(s.p1, s.p2, p1Input.left, p1Input.right, p1Input.up, p1Input.down, p1Input.block, dt);
    updateMecha(s.p2, s.p1, p2Input.left, p2Input.right, p2Input.up, p2Input.down, p2Input.block, dt);

    // 下落攻击地面冲击特效
    if (p1WasSlamming && !s.p1.isSlamming && !s.p1.isJumping) {
      s.particles.push(...spawnGroundImpact(s.p1.pos.x + MECHA_WIDTH / 2, GROUND_Y, s.p1.color));
      s.screenShake = { intensity: 6, timer: 0.15 };
    }
    if (p2WasSlamming && !s.p2.isSlamming && !s.p2.isJumping) {
      s.particles.push(...spawnGroundImpact(s.p2.pos.x + MECHA_WIDTH / 2, GROUND_Y, s.p2.color));
      s.screenShake = { intensity: 6, timer: 0.15 };
    }

    // 碰撞检测（推开）
    resolveCollision(s.p1, s.p2);

    // 攻击检测
    const combat1 = checkAttackHit(s.p1, s.p2);
    if (combat1) {
      s.particles.push(...combat1.particles);
      s.damageNumbers.push(...combat1.damageNumbers);
      if (combat1.screenShake.intensity > s.screenShake.intensity) {
        s.screenShake = combat1.screenShake;
      }
      s.screenFlash = combat1.screenFlash;
    }

    const combat2 = checkAttackHit(s.p2, s.p1);
    if (combat2) {
      s.particles.push(...combat2.particles);
      s.damageNumbers.push(...combat2.damageNumbers);
      if (combat2.screenShake.intensity > s.screenShake.intensity) {
        s.screenShake = combat2.screenShake;
      }
      s.screenFlash = combat2.screenFlash;
    }

    // 技能粒子
    if (s.p1.attackType === 'skill' && s.p1.attackHit) {
      const cx = s.p2.pos.x + MECHA_WIDTH / 2;
      const cy = s.p2.pos.y + MECHA_HEIGHT / 2;
      s.particles.push(...spawnSkillParticles(cx, cy, 'red'));
    }
    if (s.p2.attackType === 'skill' && s.p2.attackHit) {
      const cx = s.p1.pos.x + MECHA_WIDTH / 2;
      const cy = s.p1.pos.y + MECHA_HEIGHT / 2;
      s.particles.push(...spawnSkillParticles(cx, cy, 'blue'));
    }

    // 更新粒子
    updateParticles(s.particles, dt);

    // 更新伤害数字
    for (let i = s.damageNumbers.length - 1; i >= 0; i--) {
      const d = s.damageNumbers[i];
      d.y += d.vy * dt;
      d.life -= dt;
      if (d.life <= 0) s.damageNumbers.splice(i, 1);
    }

    // 清理过期粒子
    if (s.particles.length > 150) {
      s.particles = s.particles.slice(-100);
    }

    // 检测回合结束
    const winner = checkRoundEnd(s.p1, s.p2);
    if (winner) {
      const result = handleRoundEnd(winner, s.p1, s.p2);
      s.phase = result.phase;
      s.roundWinner = result.roundWinner;
      s.gameWinner = result.gameWinner;
      this.roundEndTimer = ROUND_REST;
    }

    clearJustPressed();
  }

  private handleDash(mecha: MechaState, input: InputState, time: number): void {
    if (mecha.isDashing || mecha.isBlocking) return;

    // 仅手动触发（触屏按钮/AI 显式设置）
    if (input.dash && mecha.dashCooldown <= 0) {
      const dir = mecha.facing === 'right' ? 1 : -1;
      triggerDash(mecha, dir);
    }
  }

  private updateRoundEnd(dt: number): void {
    this.roundEndTimer -= dt;
    if (this.roundEndTimer <= 0) {
      if (this.state.gameWinner) {
        this.state.phase = 'result';
      } else {
        const result = startNewRound(this.state.p1, this.state.p2);
        this.state.phase = result.phase;
        this.state.countdown = result.countdown;
        this.state.timer = 99;
        this.state.roundWinner = null;
        this.state.particles = [];
        this.state.damageNumbers = [];
      }
    }
  }

  private render(): void {
    render(this.ctx, this.state);
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  togglePause(): void {
    if (this.state.phase === 'battle' || this.state.paused) {
      this.state.paused = !this.state.paused;
    }
  }
}

/** 碰撞解析 */
function resolveCollision(a: MechaState, b: MechaState): void {
  const ax = a.pos.x;
  const ay = a.pos.y;
  const bx = b.pos.x;
  const by = b.pos.y;

  const overlapX = Math.max(0, MECHA_WIDTH - Math.abs(ax - bx));
  const overlapY = Math.max(0, MECHA_HEIGHT - Math.abs(ay - by));

  if (overlapX > 0 && overlapY > 0) {
    const pushX = overlapX / 2;
    if (ax < bx) {
      a.pos.x -= pushX;
      b.pos.x += pushX;
    } else {
      a.pos.x += pushX;
      b.pos.x -= pushX;
    }
  }

  // 边界钳制
  a.pos.x = Math.max(0, Math.min(CANVAS_WIDTH - MECHA_WIDTH, a.pos.x));
  b.pos.x = Math.max(0, Math.min(CANVAS_WIDTH - MECHA_WIDTH, b.pos.x));
}