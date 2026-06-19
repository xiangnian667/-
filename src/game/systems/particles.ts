/* ===== 粒子系统 ===== */

import type { Particle } from '../types';

/** 更新所有粒子 */
export function updateParticles(particles: Particle[], dt: number): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 200 * dt; // 重力
    p.life -= dt;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

/** 生成技能爆炸粒子 */
export function spawnSkillParticles(
  x: number,
  y: number,
  color: 'red' | 'blue'
): Particle[] {
  const particles: Particle[] = [];
  const colors =
    color === 'red'
      ? ['#ff3333', '#ff6666', '#ff9933', '#ffcc00', '#ffffff']
      : ['#3399ff', '#66bbff', '#33ccff', '#99ddff', '#ffffff'];

  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 + Math.random() * 300;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 100,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 0.5 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 4,
      type: 'energy',
    });
  }
  return particles;
}

/** 生成背景漂浮粒子 */
export function spawnAmbientParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 10,
    vy: -10 - Math.random() * 20,
    life: 3 + Math.random() * 5,
    maxLife: 3 + Math.random() * 5,
    color: Math.random() > 0.5 ? '#334466' : '#224466',
    size: 1 + Math.random() * 2,
    type: 'smoke',
  };
}

/** 生成下落攻击地面冲击粒子 */
export function spawnGroundImpact(x: number, y: number, color: 'red' | 'blue'): Particle[] {
  const particles: Particle[] = [];
  const colors = color === 'red'
    ? ['#ff64c8', '#ff99dd', '#ffccff', '#ffffff', '#ff4488']
    : ['#ff64c8', '#cc88ff', '#eeccff', '#ffffff', '#8844cc'];

  for (let i = 0; i < 18; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const speed = 80 + Math.random() * 200;
    particles.push({
      x: x + (Math.random() - 0.5) * 40,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      life: 0.25 + Math.random() * 0.35,
      maxLife: 0.25 + Math.random() * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 3,
      type: 'spark',
    });
  }

  // 冲击波环
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * 150,
      vy: -20,
      life: 0.2,
      maxLife: 0.2,
      color: '#ffffff',
      size: 2,
      type: 'energy',
    });
  }

  return particles;
}