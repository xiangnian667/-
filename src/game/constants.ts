/* ===== 像素风机甲对战 - 游戏常量 ===== */

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;
export const GROUND_Y = 520;
export const PIXEL_SIZE = 4;

// 机甲常量
export const MECHA_WIDTH = 48;
export const MECHA_HEIGHT = 64;
export const MECHA_SPEED = 200;
export const MECHA_BLOCK_SPEED = 80;
export const MECHA_JUMP = 0;
export const JUMP_VELOCITY = -340;
export const DOUBLE_JUMP_VELOCITY = -280;
export const GRAVITY = 800;
export const MAX_JUMPS = 2;
export const AIR_ATTACK_RANGE = 70;
export const SLAM_DAMAGE = 15;
export const SLAM_COOLDOWN = 3.0;
export const SLAM_SPEED = 600;

// 战斗常量
export const HP_MAX = 100;
export const EP_MAX = 100;
export const EP_REGEN = 3; // 每秒恢复
export const EP_ON_HIT = 15;
export const EP_ON_HURT = 10;

export const LIGHT_DAMAGE = 8;
export const LIGHT_RANGE = 55;
export const LIGHT_COOLDOWN = 0.4;
export const LIGHT_WINDUP = 0.08;

export const HEAVY_DAMAGE = 15;
export const HEAVY_RANGE = 65;
export const HEAVY_COOLDOWN = 0.8;
export const HEAVY_WINDUP = 0.25;

export const SKILL_DAMAGE = 20;
export const SKILL_RANGE = 75;
export const SKILL_COOLDOWN = 2.0;
export const SKILL_WINDUP = 0.15;
export const SKILL_EP_COST = 40;

export const BLOCK_REDUCTION = 0.6;

export const DASH_DISTANCE = 200;
export const DASH_DURATION = 0.15;
export const DASH_COOLDOWN = 1.5;

export const HITSTOP_DURATION = 0.08;
export const KNOCKBACK_LIGHT = 60;
export const KNOCKBACK_HEAVY = 120;
export const KNOCKBACK_SKILL = 200;

export const ANIM_FRAME_COUNT = 4;
export const ANIM_FRAME_DURATION = 0.12;

export const ROUND_COUNTDOWN = 3;
export const ROUND_REST = 2;
export const ROUNDS_TO_WIN = 2;

// 颜色
export const COLORS = {
  bgDark: '#0d0d1a',
  bgMid: '#1a1a2e',
  bgFront: '#16213e',
  p1Main: '#ff3333',
  p1Dark: '#991111',
  p1Light: '#ff6666',
  p1Accent: '#ff9933',
  p2Main: '#3399ff',
  p2Dark: '#113399',
  p2Light: '#66bbff',
  p2Accent: '#33ccff',
  energy: '#33ff66',
  gold: '#ffcc33',
  damage: '#ff9933',
  ground: '#1e2d4a',
  gridLine: '#253555',
  scanline: 'rgba(0, 0, 0, 0.06)',
  white: '#ffffff',
  black: '#000000',
};

// 键位映射
export const P1_KEYS = {
  up: 'KeyW',
  down: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  lightAttack: 'KeyJ',
  heavyAttack: 'KeyK',
  block: 'KeyL',
};

export const P2_KEYS = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  lightAttack: 'Numpad1',
  heavyAttack: 'Numpad2',
  block: 'Numpad3',
};