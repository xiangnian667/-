/* ===== 主渲染器入口 ===== */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import type { GameState, MechaState } from '../types';
import { drawScene, updateParallax } from './scene';
import { drawMecha, drawAfterimage } from './mecha';
import {
  drawParticles,
  drawDamageNumbers,
  applyScreenShake,
  drawScreenFlash,
  drawScanlines,
  drawSlashEffect,
  drawSkillBeam,
} from './effects';
import { drawHUD, drawCountdown, drawRoundEnd, drawPauseOverlay } from './hud';

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  // 清屏
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();

  // 屏幕震动
  if (state.screenShake.timer > 0) {
    applyScreenShake(ctx, state.screenShake.intensity);
  }

  // 场景
  drawScene(ctx, state.mapType);

  // 粒子（底层）
  const bgParticles = state.particles.filter((p) => p.type === 'smoke');
  drawParticles(ctx, bgParticles);

  // 机甲残影
  drawAfterimages(ctx, state.p1);
  drawAfterimages(ctx, state.p2);

  // 按 Y 坐标排序绘制机甲
  const mechas = [state.p1, state.p2].sort((a, b) => a.pos.y - b.pos.y);
  for (const m of mechas) {
    // 防御特效
    if (m.isBlocking) {
      drawBlockShield(ctx, m);
    }
    // 攻击刀光
    if (m.attackType && !m.attackHit) {
      drawAttackEffect(ctx, m);
    }
    drawMecha(ctx, m);
  }

  // 粒子（顶层）
  const fgParticles = state.particles.filter((p) => p.type !== 'smoke');
  drawParticles(ctx, fgParticles);

  // 伤害数字
  drawDamageNumbers(ctx, state.damageNumbers);

  // 屏幕闪光
  if (state.screenFlash.timer > 0) {
    drawScreenFlash(ctx, state.screenFlash.alpha, state.screenFlash.color);
  }

  ctx.restore();

  // CRT 扫描线
  drawScanlines(ctx);

  // HUD
  drawHUD(ctx, state.p1, state.p2, state.timer, state.p1.roundsWon, state.p2.roundsWon, state.mode === 'pve');

  // 覆盖层
  if (state.phase === 'countdown') {
    drawCountdown(ctx, state.countdown);
  } else if (state.phase === 'round_end') {
    drawRoundEnd(ctx, state.roundWinner || '', state.mode === 'pve');
  } else if (state.paused) {
    drawPauseOverlay(ctx);
  }
}

function drawAfterimages(ctx: CanvasRenderingContext2D, mecha: MechaState): void {
  for (const ai of mecha.afterimages) {
    const alpha = (ai.life / ai.maxLife) * 0.4;
    drawAfterimage(ctx, ai.x, ai.y, ai.facing, ai.anim, ai.animFrame, mecha.color, alpha);
  }
}

function drawBlockShield(ctx: CanvasRenderingContext2D, mecha: MechaState): void {
  const cx = mecha.pos.x + 24;
  const cy = mecha.pos.y + 32;
  const dir = mecha.facing === 'right' ? 1 : -1;

  ctx.strokeStyle = mecha.color === 'red' ? 'rgba(255, 50, 50, 0.5)' : 'rgba(50, 150, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx + dir * 10, cy, 35, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
}

function drawAttackEffect(ctx: CanvasRenderingContext2D, mecha: MechaState): void {
  const cx = mecha.pos.x + 24;
  const cy = mecha.pos.y + 30;
  const dir = mecha.facing === 'right' ? 1 : -1;
  const atkX = cx + dir * 30;

  if (mecha.attackType === 'skill') {
    drawSkillBeam(
      ctx,
      atkX,
      cy - 20,
      mecha.color === 'red' ? 'rgba(255, 50, 50, 0.6)' : 'rgba(50, 150, 255, 0.6)',
      0.7
    );
  } else {
    const size = mecha.attackType === 'heavy' ? 30 : 20;
    const alpha = mecha.attackType === 'heavy' ? 0.8 : 0.6;
    const color = mecha.color === 'red' ? '#ff6666' : '#66bbff';
    drawSlashEffect(ctx, atkX, cy, mecha.facing, color, alpha, size);
  }
}