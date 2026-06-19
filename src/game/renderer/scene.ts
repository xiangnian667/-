/* ===== 场景渲染器 ===== */

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, GROUND_Y } from '../constants';
import { drawPixelGrid, drawPixelRect } from '../../utils/pixel';

let parallaxOffset = 0;

/** 更新视差偏移 */
export function updateParallax(offset: number): void {
  parallaxOffset = offset;
}

/** 绘制完整场景背景 */
export function drawScene(ctx: CanvasRenderingContext2D): void {
  // 天空渐变
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#050510');
  skyGrad.addColorStop(0.4, '#0d0d1a');
  skyGrad.addColorStop(0.7, '#1a1a2e');
  skyGrad.addColorStop(1, '#16213e');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 远层：城市天际线剪影
  drawCitySkyline(ctx, parallaxOffset * 0.2);

  // 中层：工业管道
  drawIndustrialPipes(ctx, parallaxOffset * 0.5);

  // 近层：地面
  drawGround(ctx);

  // 网格线
  drawPixelGrid(ctx, 0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y, 32, COLORS.gridLine);
  drawPixelGrid(ctx, 0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y, 8, 'rgba(37, 53, 85, 0.3)');

  // 地面水平线
  ctx.strokeStyle = '#334466';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
  ctx.stroke();
}

function drawCitySkyline(ctx: CanvasRenderingContext2D, offset: number): void {
  ctx.fillStyle = '#0a0a15';
  const buildings = [
    { x: 0, w: 60, h: 120 },
    { x: 80, w: 40, h: 180 },
    { x: 140, w: 50, h: 100 },
    { x: 210, w: 70, h: 200 },
    { x: 300, w: 35, h: 140 },
    { x: 350, w: 55, h: 170 },
    { x: 420, w: 45, h: 110 },
    { x: 480, w: 65, h: 190 },
    { x: 560, w: 40, h: 130 },
    { x: 620, w: 75, h: 210 },
    { x: 710, w: 50, h: 150 },
    { x: 780, w: 60, h: 160 },
    { x: 860, w: 45, h: 120 },
    { x: 920, w: 55, h: 180 },
  ];

  for (const b of buildings) {
    const bx = ((b.x + offset) % (CANVAS_WIDTH + 200)) - 100;
    const by = GROUND_Y - b.h;
    ctx.fillRect(bx, by, b.w, b.h);

    // 窗户
    ctx.fillStyle = '#1a1a35';
    for (let wy = by + 8; wy < GROUND_Y - 8; wy += 16) {
      for (let wx = bx + 6; wx < bx + b.w - 6; wx += 12) {
        if (Math.random() > 0.3) {
          ctx.fillRect(wx, wy, 4, 6);
        }
      }
    }
    ctx.fillStyle = '#0a0a15';
  }
}

function drawIndustrialPipes(ctx: CanvasRenderingContext2D, offset: number): void {
  ctx.fillStyle = '#111122';
  // 左侧管道
  const pipeX = 20 + offset;
  for (let i = 0; i < 3; i++) {
    const px = pipeX + i * 60;
    const py = GROUND_Y - 80 - i * 30;
    drawPipe(ctx, px, py, 16, 80 + i * 20);
  }

  // 右侧管道
  for (let i = 0; i < 3; i++) {
    const px = CANVAS_WIDTH - 80 + offset + i * 50;
    const py = GROUND_Y - 70 - i * 25;
    drawPipe(ctx, px, py, 20, 70 + i * 15);
  }
}

function drawPipe(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
): void {
  ctx.fillStyle = '#1a1a30';
  ctx.fillRect(x, y, w, h);

  // 管道纹理
  ctx.fillStyle = '#222244';
  ctx.fillRect(x + 2, y, 4, h);
  ctx.fillRect(x + w - 6, y, 4, h);

  // 管道接口
  for (let py = y + 20; py < y + h; py += 30) {
    ctx.fillStyle = '#333355';
    ctx.fillRect(x - 2, py, w + 4, 6);
  }
}

function drawGround(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

  // 地面渐变
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, COLORS.ground);
  groundGrad.addColorStop(0.3, '#1a2a44');
  groundGrad.addColorStop(1, '#0d1525');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
}