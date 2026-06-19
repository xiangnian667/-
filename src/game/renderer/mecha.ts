/* ===== 机甲像素精灵渲染器 ===== */

import { MECHA_WIDTH, MECHA_HEIGHT, PIXEL_SIZE } from '../constants';
import type { MechaState, Facing, AnimationState } from '../types';
import { drawPixel } from '../../utils/pixel';

type ColorSet = {
  body: string;
  bodyDark: string;
  bodyLight: string;
  accent: string;
  visor: string;
  joint: string;
  weapon: string;
};

const RED_COLORS: ColorSet = {
  body: '#cc2222',
  bodyDark: '#881111',
  bodyLight: '#ff4444',
  accent: '#ff9933',
  visor: '#ffdd00',
  joint: '#444444',
  weapon: '#ff6633',
};

const BLUE_COLORS: ColorSet = {
  body: '#2255cc',
  bodyDark: '#113388',
  bodyLight: '#4488ff',
  accent: '#33ccff',
  visor: '#00ddff',
  joint: '#444444',
  weapon: '#3388ff',
};

/** 绘制机甲精灵 */
export function drawMecha(
  ctx: CanvasRenderingContext2D,
  mecha: MechaState,
  alpha: number = 1
): void {
  const colors = mecha.color === 'red' ? RED_COLORS : BLUE_COLORS;
  const { x, y } = mecha.pos;
  const px = Math.round(x / PIXEL_SIZE);
  const py = Math.round(y / PIXEL_SIZE);
  const w = Math.round(MECHA_WIDTH / PIXEL_SIZE);
  const h = Math.round(MECHA_HEIGHT / PIXEL_SIZE);

  // 受伤闪烁
  if (mecha.hurtFlash && Math.floor(Date.now() / 50) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  const flip = mecha.facing === 'left';
  const frame = mecha.animFrame;
  const anim = mecha.anim;

  // 根据动画状态偏移
  let bodyOffsetY = 0;
  let headOffsetY = 0;
  let armOffsetX = 0;
  let legOffsetY = 0;

  switch (anim) {
    case 'idle':
      bodyOffsetY = Math.sin(frame * Math.PI / 2) * 1;
      headOffsetY = bodyOffsetY;
      break;
    case 'walk':
      bodyOffsetY = Math.sin(frame * Math.PI / 2) * 2;
      headOffsetY = bodyOffsetY;
      legOffsetY = Math.sin(frame * Math.PI / 2) * 2;
      break;
    case 'light_attack':
      armOffsetX = frame < 2 ? 4 : -2;
      break;
    case 'heavy_attack':
      bodyOffsetY = frame < 2 ? -2 : 0;
      armOffsetX = frame < 2 ? -4 : 6;
      break;
    case 'skill':
      bodyOffsetY = -3;
      armOffsetX = 6;
      break;
    case 'block':
      armOffsetX = -3;
      break;
    case 'hurt':
      bodyOffsetY = -2;
      headOffsetY = -3;
      break;
    case 'dash':
      bodyOffsetY = -1;
      break;
    case 'jump':
      bodyOffsetY = -6;
      legOffsetY = 4;
      break;
    case 'air_attack':
      bodyOffsetY = -4;
      armOffsetX = frame < 2 ? 6 : 3;
      break;
    case 'slam_down':
      bodyOffsetY = -2;
      legOffsetY = 6;
      armOffsetX = frame < 2 ? 8 : 5;
      break;
  }

  ctx.save();
  if (flip) {
    ctx.translate((px + w / 2) * PIXEL_SIZE, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(px + w / 2) * PIXEL_SIZE, 0);
  }

  // --- 腿部 ---
  drawLegs(ctx, px, py, w, h, colors, legOffsetY, frame, anim);

  // --- 躯干 ---
  drawTorso(ctx, px, py, w, h, colors, bodyOffsetY);

  // --- 左臂 ---
  drawArm(ctx, px, py, w, h, colors, 'left', 0, anim, frame);

  // --- 右臂 (武器臂) ---
  drawArm(ctx, px, py, w, h, colors, 'right', armOffsetX, anim, frame);

  // --- 头部 ---
  drawHead(ctx, px, py, w, h, colors, headOffsetY, mecha.color, anim, frame);

  ctx.restore();

  if (mecha.hurtFlash) {
    ctx.globalAlpha = 1;
  }
}

function drawLegs(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, w: number, h: number,
  colors: ColorSet, legOffset: number, frame: number, anim: AnimationState
): void {
  const legTop = py + 10;
  const scale = PIXEL_SIZE;

  // 左腿
  const leftLegX = px + 3;
  let leftLegOff = 0;
  if (anim === 'walk') {
    leftLegOff = frame % 2 === 0 ? -2 : 2;
  }
  // 大腿
  drawPixelRectOnGrid(ctx, leftLegX + leftLegOff, legTop, 2, 3, colors.bodyDark);
  // 小腿
  drawPixelRectOnGrid(ctx, leftLegX + leftLegOff, legTop + 3, 2, 3, colors.body);
  // 脚
  drawPixelRectOnGrid(ctx, leftLegX + leftLegOff - 1, legTop + 6, 4, 1, colors.bodyDark);

  // 右腿
  const rightLegX = px + 7;
  let rightLegOff = 0;
  if (anim === 'walk') {
    rightLegOff = frame % 2 === 0 ? 2 : -2;
  }
  drawPixelRectOnGrid(ctx, rightLegX + rightLegOff, legTop, 2, 3, colors.bodyDark);
  drawPixelRectOnGrid(ctx, rightLegX + rightLegOff, legTop + 3, 2, 3, colors.body);
  drawPixelRectOnGrid(ctx, rightLegX + rightLegOff - 1, legTop + 6, 4, 1, colors.bodyDark);
}

function drawTorso(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, w: number, h: number,
  colors: ColorSet, offsetY: number
): void {
  const tx = px + 2;
  const ty = py + 3 + offsetY;

  // 躯干主体
  drawPixelRectOnGrid(ctx, tx, ty, 8, 7, colors.body);

  // 躯干暗色边缘
  drawPixelRectOnGrid(ctx, tx, ty, 8, 1, colors.bodyDark);
  drawPixelRectOnGrid(ctx, tx, ty + 6, 8, 1, colors.bodyDark);

  // 胸部装甲
  drawPixelRectOnGrid(ctx, tx + 1, ty + 1, 2, 3, colors.bodyLight);
  drawPixelRectOnGrid(ctx, tx + 5, ty + 1, 2, 3, colors.bodyLight);

  // 中心线
  drawPixelRectOnGrid(ctx, tx + 3, ty + 2, 2, 5, colors.accent);

  // 腰部
  drawPixelRectOnGrid(ctx, tx + 1, ty + 7, 6, 1, colors.bodyDark);
}

function drawArm(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, w: number, h: number,
  colors: ColorSet, side: 'left' | 'right',
  offsetX: number, anim: AnimationState, frame: number
): void {
  const isWeaponArm = side === 'right';
  const ax = side === 'left' ? px + 1 : px + 9;
  const ay = py + 3;

  const armColor = isWeaponArm ? colors.bodyLight : colors.body;
  const weaponColor = colors.weapon;

  // 上臂
  drawPixelRectOnGrid(ctx, ax + offsetX, ay, 2, 3, armColor);
  // 前臂
  drawPixelRectOnGrid(ctx, ax + offsetX, ay + 3, 2, 3, colors.bodyDark);

  // 武器臂特效
  if (isWeaponArm) {
    if (anim === 'light_attack' && frame >= 1) {
      // 拳套延伸
      const extX = ax + offsetX + 2;
      drawPixelRectOnGrid(ctx, extX, ay + 2, 2, 2, weaponColor);
      drawPixelRectOnGrid(ctx, extX + 2, ay + 2, 1, 2, colors.accent);
    } else if (anim === 'heavy_attack' && frame >= 1) {
      const extX = ax + offsetX + 2;
      drawPixelRectOnGrid(ctx, extX, ay + 1, 3, 3, weaponColor);
      drawPixelRectOnGrid(ctx, extX + 3, ay + 1, 1, 3, colors.accent);
    } else if (anim === 'skill') {
      const extX = ax + offsetX + 2;
      drawPixelRectOnGrid(ctx, extX, ay, 4, 4, weaponColor);
      drawPixelRectOnGrid(ctx, extX + 1, ay - 1, 2, 1, colors.accent);
      drawPixelRectOnGrid(ctx, extX + 4, ay + 1, 1, 2, colors.accent);
    } else {
      // 正常武器
      drawPixelRectOnGrid(ctx, ax + offsetX + 2, ay + 2, 1, 2, weaponColor);
    }
  }
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, w: number, h: number,
  colors: ColorSet, offsetY: number, mechaColor: 'red' | 'blue',
  anim: AnimationState, frame: number
): void {
  const hx = px + 3;
  const hy = py + offsetY;

  // 头部主体
  drawPixelRectOnGrid(ctx, hx, hy, 6, 4, colors.body);

  // 天线
  if (mechaColor === 'red') {
    // V 形天线
    drawPixelRectOnGrid(ctx, hx, hy - 1, 1, 1, colors.accent);
    drawPixelRectOnGrid(ctx, hx + 5, hy - 1, 1, 1, colors.accent);
    drawPixelRectOnGrid(ctx, hx + 1, hy - 2, 1, 1, colors.accent);
    drawPixelRectOnGrid(ctx, hx + 4, hy - 2, 1, 1, colors.accent);
    drawPixelRectOnGrid(ctx, hx + 2, hy - 3, 2, 1, colors.accent);
  } else {
    // 弧形天线
    drawPixelRectOnGrid(ctx, hx + 1, hy - 1, 4, 1, colors.accent);
    drawPixelRectOnGrid(ctx, hx, hy - 2, 2, 1, colors.accent);
    drawPixelRectOnGrid(ctx, hx + 4, hy - 2, 2, 1, colors.accent);
  }

  // 面罩/眼睛
  drawPixelRectOnGrid(ctx, hx + 1, hy + 1, 4, 1, colors.visor);

  // 头部细节
  drawPixelRectOnGrid(ctx, hx, hy, 6, 1, colors.bodyDark);
  drawPixelRectOnGrid(ctx, hx + 1, hy + 2, 1, 1, colors.bodyLight);
  drawPixelRectOnGrid(ctx, hx + 4, hy + 2, 1, 1, colors.bodyLight);

  // 嘴部
  drawPixelRectOnGrid(ctx, hx + 2, hy + 3, 2, 1, colors.bodyDark);
}

function drawPixelRectOnGrid(
  ctx: CanvasRenderingContext2D,
  gx: number, gy: number, gw: number, gh: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(gx * PIXEL_SIZE, gy * PIXEL_SIZE, gw * PIXEL_SIZE, gh * PIXEL_SIZE);
}

/** 绘制机甲残影 */
export function drawAfterimage(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  facing: Facing, anim: AnimationState, animFrame: number,
  color: 'red' | 'blue',
  alpha: number
): void {
  // 创建临时机甲状态用于绘制
  const temp: MechaState = {
    id: 'p1',
    pos: { x, y },
    vel: { x: 0, y: 0 },
    hp: 100, maxHp: 100, ep: 0, maxEp: 100,
    facing,
    anim,
    animFrame,
    animTimer: 0,
    isBlocking: false,
    lightCooldown: 0, heavyCooldown: 0, skillCooldown: 0,
    dashCooldown: 0,
    isDashing: false,
    dashTimer: 0,
    dashDir: 0,
    afterimages: [],
    invincible: false,
    hitstopTimer: 0,
    hurtFlash: false,
    color,
    combo: 0,
    roundsWon: 0,
    attackHit: false,
    attackType: null,
    attackTimer: 0,
    knockback: { x: 0, y: 0 },
    isJumping: false,
    jumpVel: 0,
    canAirAttack: true,
    jumpCount: 0,
    maxJumps: 2,
    slamCooldown: 0,
    isSlamming: false,
    landingLag: 0,
  };
  drawMecha(ctx, temp, alpha);
}