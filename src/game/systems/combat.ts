/* ===== 战斗系统 ===== */

import type { MechaState, Particle, DamageNumber } from '../types';
import {
  LIGHT_DAMAGE,
  LIGHT_RANGE,
  LIGHT_WINDUP,
  HEAVY_DAMAGE,
  HEAVY_RANGE,
  HEAVY_WINDUP,
  SKILL_DAMAGE,
  SKILL_RANGE,
  SKILL_WINDUP,
  BLOCK_REDUCTION,
  HITSTOP_DURATION,
  KNOCKBACK_LIGHT,
  KNOCKBACK_HEAVY,
  KNOCKBACK_SKILL,
  EP_ON_HIT,
  EP_ON_HURT,
  MECHA_WIDTH,
  MECHA_HEIGHT,
  SLAM_DAMAGE,
} from '../constants';

export interface CombatResult {
  particles: Particle[];
  damageNumbers: DamageNumber[];
  screenShake: { intensity: number; timer: number };
  screenFlash: { alpha: number; timer: number; color: string };
}

/** 获取攻击方的攻击中心点 */
function getAttackCenter(attacker: MechaState): { x: number; y: number } {
  const cx = attacker.pos.x + MECHA_WIDTH / 2;
  const cy = attacker.pos.y + MECHA_HEIGHT / 2;
  const offsetX = attacker.facing === 'right' ? MECHA_WIDTH / 2 + 15 : -MECHA_WIDTH / 2 - 15;
  return { x: cx + offsetX, y: cy };
}

/** 检测是否在攻击范围内 */
function isInRange(
  attacker: MechaState,
  defender: MechaState,
  range: number
): boolean {
  const atkCenter = getAttackCenter(attacker);
  const defCenter = {
    x: defender.pos.x + MECHA_WIDTH / 2,
    y: defender.pos.y + MECHA_HEIGHT / 2,
  };
  const dx = atkCenter.x - defCenter.x;
  const dy = atkCenter.y - defCenter.y;
  return Math.sqrt(dx * dx + dy * dy) <= range;
}

/** 生成命中粒子 */
function spawnHitParticles(
  x: number,
  y: number,
  attackerColor: string,
  count: number
): Particle[] {
  const particles: Particle[] = [];
  const colors = attackerColor === 'red'
    ? ['#ff3333', '#ff6666', '#ff9933', '#ffcc00', '#ffffff']
    : ['#3399ff', '#66bbff', '#33ccff', '#99ddff', '#ffffff'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 200;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      life: 0.3 + Math.random() * 0.4,
      maxLife: 0.3 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 3,
      type: 'spark',
    });
  }
  return particles;
}

/** 攻击判定 */
export function checkAttackHit(
  attacker: MechaState,
  defender: MechaState
): CombatResult | null {
  const result: CombatResult = {
    particles: [],
    damageNumbers: [],
    screenShake: { intensity: 0, timer: 0 },
    screenFlash: { alpha: 0, timer: 0, color: '#ffffff' },
  };

  if (!attacker.attackType || attacker.attackHit) return null;

  let range: number;
  let damage: number;
  let windup: number;
  let knockback: number;
  let flashColor: string;

  switch (attacker.attackType) {
    case 'light':
      range = LIGHT_RANGE;
      damage = LIGHT_DAMAGE;
      windup = LIGHT_WINDUP;
      knockback = KNOCKBACK_LIGHT;
      flashColor = 'rgba(255, 255, 255, 0.3)';
      break;
    case 'heavy':
      range = HEAVY_RANGE;
      damage = attacker.isSlamming ? SLAM_DAMAGE : HEAVY_DAMAGE;
      windup = attacker.isSlamming ? 0 : HEAVY_WINDUP;
      knockback = attacker.isSlamming ? KNOCKBACK_SKILL : KNOCKBACK_HEAVY;
      flashColor = attacker.isSlamming ? 'rgba(255, 100, 200, 0.6)' : 'rgba(255, 255, 255, 0.5)';
      break;
    case 'skill':
      range = SKILL_RANGE;
      damage = SKILL_DAMAGE;
      windup = SKILL_WINDUP;
      knockback = KNOCKBACK_SKILL;
      flashColor = attacker.color === 'red'
        ? 'rgba(255, 50, 50, 0.4)'
        : 'rgba(50, 150, 255, 0.4)';
      break;
    default:
      return null;
  }

  // 前摇检查：攻击需要达到前摇时间才能命中
  const attackElapsed = attacker.attackTimer > 0 ? 0.3 - attacker.attackTimer : 0;
  if (attackElapsed < windup) return null;

  if (!isInRange(attacker, defender, range)) return null;

  // 无敌帧检查
  if (defender.invincible) return null;

  attacker.attackHit = true;

  // 伤害计算
  let finalDamage = damage;
  if (defender.isBlocking) {
    finalDamage = Math.floor(damage * (1 - BLOCK_REDUCTION));
  }

  defender.hp = Math.max(0, defender.hp - finalDamage);
  defender.hitstopTimer = HITSTOP_DURATION;
  if (defender.isBlocking) {
    // 被格挡：不播放受伤动画，播放格挡火花
    defender.hurtFlash = false;
    defender.anim = 'block';
    defender.animFrame = 0;
    defender.animTimer = 0;
  } else {
    defender.hurtFlash = true;
    defender.anim = 'hurt';
    defender.animFrame = 0;
    defender.animTimer = 0;
  }

  // 击退
  const kbDir = attacker.facing === 'right' ? 1 : -1;
  defender.knockback = {
    x: kbDir * knockback,
    y: -30,
  };

  // 能量
  attacker.ep = Math.min(attacker.maxEp, attacker.ep + EP_ON_HIT);
  defender.ep = Math.min(defender.maxEp, defender.ep + EP_ON_HURT);

  // 连击
  attacker.combo = (attacker.combo || 0) + 1;
  setTimeout(() => { attacker.combo = 0; }, 2000);

  // 粒子
  const hitCenter = {
    x: defender.pos.x + MECHA_WIDTH / 2,
    y: defender.pos.y + MECHA_HEIGHT / 3,
  };
  result.particles = spawnHitParticles(
    hitCenter.x,
    hitCenter.y,
    attacker.color,
    attacker.attackType === 'skill' ? 20 : attacker.isSlamming ? 18 : attacker.attackType === 'heavy' ? 12 : 8
  );

  // 格挡火花
  if (defender.isBlocking) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 100;
      result.particles.push({
        x: hitCenter.x,
        y: hitCenter.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0.15 + Math.random() * 0.2,
        maxLife: 0.15 + Math.random() * 0.2,
        color: ['#fff', '#ffcc33', '#ffaa00', '#ffdd66'][Math.floor(Math.random() * 4)],
        size: 1 + Math.random() * 2,
        type: 'spark' as const,
      });
    }
  }

  // 伤害数字
  result.damageNumbers.push({
    x: hitCenter.x + (Math.random() - 0.5) * 20,
    y: hitCenter.y - 20,
    value: finalDamage,
    life: 0.8,
    maxLife: 0.8,
    vy: -60,
    color: attacker.isSlamming ? '#ff64c8' : attacker.attackType === 'skill' ? '#ffcc33' : '#ff9933',
  });

  // 屏幕震动
  result.screenShake = {
    intensity: attacker.isSlamming ? 10 : attacker.attackType === 'skill' ? 8 : attacker.attackType === 'heavy' ? 5 : 3,
    timer: 0.15,
  };

  // 屏幕闪光
  result.screenFlash = {
    alpha: attacker.isSlamming ? 0.6 : attacker.attackType === 'skill' ? 0.5 : attacker.attackType === 'heavy' ? 0.3 : 0.15,
    timer: 0.1,
    color: flashColor,
  };

  return result;
}