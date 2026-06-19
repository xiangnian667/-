/* ===== 场景渲染器 ===== */

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, GROUND_Y } from '../constants';
import type { MapType } from '../types';
import { drawPixelGrid } from '../../utils/pixel';

let parallaxOffset = 0;

/** 更新视差偏移 */
export function updateParallax(offset: number): void {
  parallaxOffset = offset;
}

/** 绘制完整场景背景 */
export function drawScene(ctx: CanvasRenderingContext2D, mapType: MapType = 'city'): void {
  switch (mapType) {
    case 'city': drawCityScene(ctx); break;
    case 'desert': drawDesertScene(ctx); break;
    case 'space': drawSpaceScene(ctx); break;
    case 'dojo': drawDojoScene(ctx); break;
  }

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

// ====== 城市夜景 ======
function drawCityScene(ctx: CanvasRenderingContext2D): void {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#050510');
  skyGrad.addColorStop(0.4, '#0d0d1a');
  skyGrad.addColorStop(0.7, '#1a1a2e');
  skyGrad.addColorStop(1, '#16213e');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawCitySkyline(ctx, parallaxOffset * 0.2);
  drawIndustrialPipes(ctx, parallaxOffset * 0.5);
  drawGround(ctx, '#1e2d4a', '#1a2a44', '#0d1525');
}

// ====== 沙漠 ======
function drawDesertScene(ctx: CanvasRenderingContext2D): void {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#1a0a00');
  skyGrad.addColorStop(0.3, '#3d1c00');
  skyGrad.addColorStop(0.6, '#8b4513');
  skyGrad.addColorStop(1, '#c4a35a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 太阳
  ctx.fillStyle = '#ff6600';
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH * 0.7, 120, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 102, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH * 0.7, 120, 70, 0, Math.PI * 2);
  ctx.fill();

  // 沙丘
  const duneOffset = parallaxOffset * 0.3;
  ctx.fillStyle = '#a0522d';
  for (let i = 0; i < 8; i++) {
    const dx = ((i * 120 + duneOffset) % (CANVAS_WIDTH + 200)) - 100;
    ctx.beginPath();
    ctx.moveTo(dx - 40, GROUND_Y);
    ctx.quadraticCurveTo(dx, GROUND_Y - 60 - i * 10, dx + 40, GROUND_Y);
    ctx.fill();
  }

  drawGround(ctx, '#8b6914', '#a07828', '#5c3d0e');
}

// ====== 太空站 ======
function drawSpaceScene(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#020210';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 星星
  const starSeed = 42;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 80; i++) {
    const sx = ((i * 137 + starSeed) % CANVAS_WIDTH);
    const sy = ((i * 91 + starSeed * 3) % (GROUND_Y - 40));
    const size = (i % 3 === 0) ? 2 : 1;
    const alpha = 0.3 + (i % 5) * 0.15;
    ctx.globalAlpha = alpha;
    ctx.fillRect(sx, sy, size, size);
  }
  ctx.globalAlpha = 1;

  // 星云
  const nebulaGrad = ctx.createRadialGradient(200, 100, 0, 200, 100, 200);
  nebulaGrad.addColorStop(0, 'rgba(100, 0, 200, 0.15)');
  nebulaGrad.addColorStop(0.5, 'rgba(0, 50, 150, 0.08)');
  nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = nebulaGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

  // 空间站平台
  const platOffset = parallaxOffset * 0.2;
  ctx.fillStyle = '#1a1a2e';
  for (let i = 0; i < 5; i++) {
    const px = ((i * 200 + platOffset) % (CANVAS_WIDTH + 300)) - 150;
    ctx.fillRect(px, GROUND_Y - 20, 120, 20);
    ctx.fillRect(px + 10, GROUND_Y - 100, 8, 80);
    ctx.fillRect(px + 100, GROUND_Y - 100, 8, 80);
  }

  drawGround(ctx, '#111133', '#1a1a44', '#08081a');
}

// ====== 道场 ======
function drawDojoScene(ctx: CanvasRenderingContext2D): void {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#1a1208');
  skyGrad.addColorStop(0.5, '#2d1f0e');
  skyGrad.addColorStop(1, '#3d2a14');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 灯笼
  const lanternOffset = parallaxOffset * 0.1;
  for (let i = 0; i < 6; i++) {
    const lx = ((i * 160 + lanternOffset) % (CANVAS_WIDTH + 200)) - 100;
    // 绳子
    ctx.strokeStyle = '#5c3d0e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, 60);
    ctx.stroke();
    // 灯笼
    ctx.fillStyle = '#cc2200';
    ctx.fillRect(lx - 8, 60, 16, 22);
    ctx.fillStyle = '#ff9933';
    ctx.fillRect(lx - 6, 62, 12, 3);
    ctx.fillStyle = 'rgba(255, 150, 50, 0.3)';
    ctx.fillRect(lx - 12, 62, 24, 5);
  }

  // 木柱
  ctx.fillStyle = '#3d1f0a';
  ctx.fillRect(50, 0, 10, GROUND_Y);
  ctx.fillRect(CANVAS_WIDTH - 60, 0, 10, GROUND_Y);

  drawGround(ctx, '#2d1a0a', '#3d2a14', '#1a0e05');
}

// ====== 通用组件 ======

function drawGround(ctx: CanvasRenderingContext2D, top: string, mid: string, bottom: string): void {
  ctx.fillStyle = top;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, top);
  groundGrad.addColorStop(0.3, mid);
  groundGrad.addColorStop(1, bottom);
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
}

function drawCitySkyline(ctx: CanvasRenderingContext2D, offset: number): void {
  ctx.fillStyle = '#0a0a15';
  const buildings = [
    { x: 0, w: 60, h: 120 }, { x: 80, w: 40, h: 180 }, { x: 140, w: 50, h: 100 },
    { x: 210, w: 70, h: 200 }, { x: 300, w: 35, h: 140 }, { x: 350, w: 55, h: 170 },
    { x: 420, w: 45, h: 110 }, { x: 480, w: 65, h: 190 }, { x: 560, w: 40, h: 130 },
    { x: 620, w: 75, h: 210 }, { x: 710, w: 50, h: 150 }, { x: 780, w: 60, h: 160 },
    { x: 860, w: 45, h: 120 }, { x: 920, w: 55, h: 180 },
  ];

  for (const b of buildings) {
    const bx = ((b.x + offset) % (CANVAS_WIDTH + 200)) - 100;
    const by = GROUND_Y - b.h;
    ctx.fillRect(bx, by, b.w, b.h);

    ctx.fillStyle = '#1a1a35';
    for (let wy = by + 8; wy < GROUND_Y - 8; wy += 16) {
      for (let wx = bx + 6; wx < bx + b.w - 6; wx += 12) {
        if (Math.random() > 0.3) ctx.fillRect(wx, wy, 4, 6);
      }
    }
    ctx.fillStyle = '#0a0a15';
  }
}

function drawIndustrialPipes(ctx: CanvasRenderingContext2D, offset: number): void {
  ctx.fillStyle = '#111122';
  const pipeX = 20 + offset;
  for (let i = 0; i < 3; i++) {
    const px = pipeX + i * 60;
    const py = GROUND_Y - 80 - i * 30;
    drawPipe(ctx, px, py, 16, 80 + i * 20);
  }
  for (let i = 0; i < 3; i++) {
    const px = CANVAS_WIDTH - 80 + offset + i * 50;
    const py = GROUND_Y - 70 - i * 25;
    drawPipe(ctx, px, py, 20, 70 + i * 15);
  }
}

function drawPipe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = '#1a1a30';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#222244';
  ctx.fillRect(x + 2, y, 4, h);
  ctx.fillRect(x + w - 6, y, 4, h);
  for (let py = y + 20; py < y + h; py += 30) {
    ctx.fillStyle = '#333355';
    ctx.fillRect(x - 2, py, w + 4, 6);
  }
}