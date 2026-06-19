/* ===== 像素绘制工具函数 ===== */

import { PIXEL_SIZE } from '../game/constants';

/** 在 Canvas 上绘制一个像素块 */
export function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  alpha: number = 1
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
  ctx.globalAlpha = 1;
}

/** 绘制像素矩形 */
export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  alpha: number = 1
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * PIXEL_SIZE, h * PIXEL_SIZE);
  ctx.globalAlpha = 1;
}

/** 绘制像素文本（简易版） */
export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size: number = 16,
  align: CanvasTextAlign = 'left'
): void {
  ctx.font = `${size}px "Press Start 2P", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

/** 绘制像素网格图案 */
export function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  gridSize: number,
  color: string
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = x; i <= x + w; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, y);
    ctx.lineTo(i, y + h);
    ctx.stroke();
  }
  for (let j = y; j <= y + h; j += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, j);
    ctx.lineTo(x + w, j);
    ctx.stroke();
  }
}

/** 创建一个离屏 Canvas 用于缓存像素精灵 */
export function createOffscreenCanvas(w: number, h: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}