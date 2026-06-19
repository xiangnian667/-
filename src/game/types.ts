/* ===== 像素风机甲对战 - 类型定义 ===== */

export type GamePhase = 'menu' | 'countdown' | 'battle' | 'round_end' | 'result';
export type GameMode = 'pvp' | 'pve';
export type MapType = 'city' | 'desert' | 'space' | 'dojo';

export type AnimationState =
  | 'idle'
  | 'walk'
  | 'light_attack'
  | 'heavy_attack'
  | 'skill'
  | 'block'
  | 'hurt'
  | 'dash'
  | 'jump'
  | 'air_attack';

export type Facing = 'left' | 'right';

export interface Vec2 {
  x: number;
  y: number;
}

export interface MechaState {
  id: 'p1' | 'p2';
  pos: Vec2;
  vel: Vec2;
  hp: number;
  maxHp: number;
  ep: number;
  maxEp: number;
  facing: Facing;
  anim: AnimationState;
  animFrame: number;
  animTimer: number;
  isBlocking: boolean;
  lightCooldown: number;
  heavyCooldown: number;
  skillCooldown: number;
  dashCooldown: number;
  isDashing: boolean;
  dashTimer: number;
  dashDir: number;
  afterimages: Afterimage[];
  invincible: boolean;
  hitstopTimer: number;
  hurtFlash: boolean;
  color: 'red' | 'blue';
  combo: number;
  roundsWon: number;
  attackHit: boolean;
  attackType: 'light' | 'heavy' | 'skill' | null;
  attackTimer: number;
  knockback: Vec2;
  isJumping: boolean;
  jumpVel: number;
  canAirAttack: boolean;
}

export interface Afterimage {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  facing: Facing;
  anim: AnimationState;
  animFrame: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'smoke' | 'energy';
}

export interface DamageNumber {
  x: number;
  y: number;
  value: number;
  life: number;
  maxLife: number;
  vy: number;
  color: string;
}

export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  mapType: MapType;
  p1: MechaState;
  p2: MechaState;
  particles: Particle[];
  damageNumbers: DamageNumber[];
  screenShake: { intensity: number; timer: number };
  screenFlash: { alpha: number; timer: number; color: string };
  timer: number;
  countdown: number;
  roundWinner: string | null;
  gameWinner: string | null;
  paused: boolean;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  lightAttack: boolean;
  heavyAttack: boolean;
  block: boolean;
  dash: boolean;
  jump: boolean;
}