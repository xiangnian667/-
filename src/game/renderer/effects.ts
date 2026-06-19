/* ===== 特效渲染器 ===== */

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../constants';
import type { Particle, DamageNumber } from '../types';
import { drawPixelText } from '../../utils/pixel';

/** 绘制粒子 */
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

/** 绘制伤害数字 */
export function drawDamageNumbers(
  ctx: CanvasRenderingContext2D,
  damageNumbers: DamageNumber[]
): void {
  for (const d of damageNumbers) {
    const alpha = Math.max(0, d.life / d.maxLife);
    ctx.globalAlpha = alpha;
    // 伤害数字放大
    const size = 16 + (1 - alpha) * 8;
    ctx.font = `bold ${size}px "Press Start 2P", monospace`;
    ctx.fillStyle = d.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 描边
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(`-${d.value}`, d.x, d.y);
    ctx.fillText(`-${d.value}`, d.x, d.y);
  }
  ctx.globalAlpha = 1;
}

/** 绘制屏幕震动偏移 */
export function applyScreenShake(
  ctx: CanvasRenderingContext2D,
  intensity: number
): void {
  if (intensity <= 0) return;
  const shakeX = (Math.random() - 0.5) * intensity * 2;
  const shakeY = (Math.random() - 0.5) * intensity * 2;
  ctx.translate(shakeX, shakeY);
}

/** 绘制屏幕闪光 */
export function drawScreenFlash(
  ctx: CanvasRenderingContext2D,
  alpha: number,
  color: string
): void {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.globalAlpha = 1;
}

/** 绘制 CRT 扫描线 */
export function drawScanlines(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.scanline;
  for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
    ctx.fillRect(0, y, CANVAS_WIDTH, 1);
  }
}

/** 绘制攻击刀光 */
export function drawSlashEffect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  facing: 'left' | 'right',
  color: string,
  alpha: number,
  size: number
): void {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  const dir = facing === 'right' ? 1 : -1;
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + dir * size * 1.5, y);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  // 内层光效
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.globalAlpha = alpha * 0.7;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.7);
  ctx.lineTo(x + dir * size * 1.2, y);
  ctx.lineTo(x, y + size * 0.7);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

/** 绘制技能能量柱 */
export function drawSkillBeam(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: string,
  alpha: number
): void {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  const grad = ctx.createLinearGradient(x, y - 30, x, CANVAS_HEIGHT);
  grad.addColorStop(0, 'rgba(255,255,255,0.8)');
  grad.addColorStop(0.3, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x - 20, y - 30, 40, CANVAS_HEIGHT - y + 30);
  ctx.globalAlpha = 1;
}