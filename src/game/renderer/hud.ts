/* ===== HUD 渲染器 ===== */

import { CANVAS_WIDTH, COLORS, SLAM_COOLDOWN } from '../constants';
import type { MechaState } from '../types';
import { drawPixelText, drawPixelRect } from '../../utils/pixel';

/** 绘制 HUD */
export function drawHUD(
  ctx: CanvasRenderingContext2D,
  p1: MechaState,
  p2: MechaState,
  timer: number,
  p1Rounds: number,
  p2Rounds: number,
  isPvE: boolean = false
): void {
  // HUD 背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 52);

  // 顶部装饰线
  ctx.fillStyle = '#334466';
  ctx.fillRect(0, 52, CANVAS_WIDTH, 2);

  // P1 血条
  drawPlayerHUD(ctx, 20, 8, p1, 'left', p1Rounds, isPvE);

  // 计时器
  drawTimer(ctx, CANVAS_WIDTH / 2, 12, timer);

  // P2 血条
  drawPlayerHUD(ctx, CANVAS_WIDTH - 20, 8, p2, 'right', p2Rounds, isPvE);
}

function drawPlayerHUD(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  mecha: MechaState,
  align: 'left' | 'right',
  rounds: number,
  isPvE: boolean = false
): void {
  const barWidth = 180;
  const barHeight = 8;
  const startX = align === 'left' ? x : x - barWidth;
  const color = mecha.color === 'red' ? COLORS.p1Main : COLORS.p2Main;
  const colorDark = mecha.color === 'red' ? COLORS.p1Dark : COLORS.p2Dark;

  // 玩家标签
  const label = mecha.id === 'p1' ? '1P' : isPvE ? '电脑' : '2P';
  drawPixelText(
    ctx,
    label,
    align === 'left' ? startX : startX + barWidth,
    y - 2,
    color,
    12,
    align === 'left' ? 'left' : 'right'
  );

  // 血条背景
  ctx.fillStyle = '#111122';
  ctx.fillRect(startX, y + 6, barWidth, barHeight);

  // 血条
  const hpRatio = mecha.hp / mecha.maxHp;
  const hpColor = hpRatio > 0.5 ? color : hpRatio > 0.25 ? '#ff9933' : '#ff3333';
  ctx.fillStyle = hpColor;
  ctx.fillRect(startX, y + 6, barWidth * hpRatio, barHeight);

  // 血条边框
  ctx.strokeStyle = '#334466';
  ctx.lineWidth = 1;
  ctx.strokeRect(startX, y + 6, barWidth, barHeight);

  // 血条分段线
  for (let i = 1; i < 10; i++) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(startX + barWidth * (i / 10) - 1, y + 6, 2, barHeight);
  }

  // 能量条
  const epBarY = y + 18;
  ctx.fillStyle = '#111122';
  ctx.fillRect(startX, epBarY, barWidth, 4);

  const epRatio = mecha.ep / mecha.maxEp;
  ctx.fillStyle = COLORS.energy;
  ctx.fillRect(startX, epBarY, barWidth * epRatio, 4);

  ctx.strokeStyle = '#334466';
  ctx.strokeRect(startX, epBarY, barWidth, 4);

  // 回合指示灯
  for (let i = 0; i < 2; i++) {
    const dotX = align === 'left' ? startX + barWidth + 16 + i * 14 : startX - 16 - i * 14;
    ctx.fillStyle = i < rounds ? color : '#222233';
    ctx.beginPath();
    ctx.arc(dotX, y + 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334466';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 连击数
  if (mecha.combo > 1) {
    drawPixelText(
      ctx,
      `${mecha.combo} 连击!`,
      align === 'left' ? startX + 20 : startX + barWidth - 20,
      y + 32,
      COLORS.gold,
      10,
      align === 'left' ? 'left' : 'right'
    );
  }

  // 下落攻击 CD 指示器
  const slamReady = mecha.slamCooldown <= 0;
  const cdY = y + 30;
  const cdX = align === 'left' ? startX : startX + barWidth;
  const cdLabelX = align === 'left' ? cdX : cdX - 55;

  // CD 图标
  ctx.fillStyle = slamReady ? '#ff64c8' : '#442244';
  ctx.fillRect(cdLabelX, cdY, 4, 8);
  ctx.fillRect(cdLabelX + 4, cdY + 2, 2, 4);
  ctx.fillRect(cdLabelX + 6, cdY, 4, 8);

  if (!slamReady) {
    const cdRatio = mecha.slamCooldown / SLAM_COOLDOWN;
    const cdText = mecha.slamCooldown.toFixed(1);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(cdLabelX + 12, cdY, 38, 8);
    ctx.fillStyle = '#ff64c8';
    ctx.fillRect(cdLabelX + 12, cdY, 38 * (1 - cdRatio), 8);
    drawPixelText(ctx, cdText, cdLabelX + 31, cdY + 8, '#ffffff', 7, 'center');
  } else {
    drawPixelText(ctx, '就绪', cdLabelX + 14, cdY + 8, '#ff64c8', 7, 'left');
  }

  // 落地硬直指示（无法跳跃）
  if (mecha.landingLag > 0) {
    drawPixelText(ctx, '!', cdLabelX + 52, cdY + 8, '#ff6644', 8, 'center');
  }
}

function drawTimer(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  timer: number
): void {
  const minutes = Math.floor(timer / 60);
  const seconds = Math.floor(timer % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // 计时器背景
  ctx.fillStyle = '#111122';
  ctx.fillRect(x - 40, y - 4, 80, 24);
  ctx.strokeStyle = '#334466';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 40, y - 4, 80, 24);

  drawPixelText(ctx, timeStr, x, y + 8, COLORS.white, 14, 'center');
}

/** 绘制倒计时 */
export function drawCountdown(
  ctx: CanvasRenderingContext2D,
  countdown: number
): void {
  const alpha = 0.7;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 640);

  const num = Math.ceil(countdown);
  const text = num > 0 ? num.toString() : '开战!';
  const color = num > 0 ? COLORS.white : COLORS.gold;
  const scale = 1 + (num > 0 ? (1 - (countdown - Math.floor(countdown))) * 0.3 : 0.5);

  ctx.save();
  ctx.translate(CANVAS_WIDTH / 2, 320);
  ctx.scale(scale, scale);
  ctx.globalAlpha = 1;
  drawPixelText(ctx, text, 0, 0, color, 48, 'center');
  ctx.restore();

  ctx.globalAlpha = 1;
}

/** 绘制回合结束 */
export function drawRoundEnd(
  ctx: CanvasRenderingContext2D,
  winner: string,
  isPvE: boolean = false
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 640);

  const winnerLabel = winner === 'p1' ? '玩家1' : isPvE ? '电脑' : '玩家2';
  const color = winner === 'p1' ? COLORS.p1Main : COLORS.p2Main;

  drawPixelText(ctx, `${winnerLabel}`, CANVAS_WIDTH / 2, 280, color, 20, 'center');
  drawPixelText(ctx, '赢得本回合!', CANVAS_WIDTH / 2, 320, COLORS.white, 14, 'center');
}

/** 绘制暂停遮罩 */
export function drawPauseOverlay(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 640);

  drawPixelText(ctx, '暂停中', CANVAS_WIDTH / 2, 280, COLORS.white, 32, 'center');
  drawPixelText(ctx, '按 ESC 继续', CANVAS_WIDTH / 2, 330, '#888888', 10, 'center');
}