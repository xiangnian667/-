/* ===== 机甲实体 ===== */

import type { MechaState, AnimationState } from '../types';
import {
  MECHA_WIDTH,
  MECHA_HEIGHT,
  MECHA_SPEED,
  MECHA_BLOCK_SPEED,
  CANVAS_WIDTH,
  GROUND_Y,
  DASH_DISTANCE,
  DASH_DURATION,
  DASH_COOLDOWN,
  HP_MAX,
  EP_MAX,
  ANIM_FRAME_COUNT,
  ANIM_FRAME_DURATION,
  JUMP_VELOCITY,
  DOUBLE_JUMP_VELOCITY,
  GRAVITY,
  MAX_JUMPS,
  SLAM_COOLDOWN,
  SLAM_SPEED,
} from '../constants';

export function createMecha(
  id: 'p1' | 'p2',
  x: number,
  color: 'red' | 'blue'
): MechaState {
  return {
    id,
    pos: { x, y: GROUND_Y - MECHA_HEIGHT },
    vel: { x: 0, y: 0 },
    hp: HP_MAX,
    maxHp: HP_MAX,
    ep: 0,
    maxEp: EP_MAX,
    facing: id === 'p1' ? 'right' : 'left',
    anim: 'idle',
    animFrame: 0,
    animTimer: 0,
    isBlocking: false,
    lightCooldown: 0,
    heavyCooldown: 0,
    skillCooldown: 0,
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
    maxJumps: MAX_JUMPS,
    slamCooldown: 0,
    isSlamming: false,
  };
}

/** 更新机甲面对方向 */
function updateFacing(mecha: MechaState, opponent: MechaState): void {
  if (mecha.isDashing || mecha.anim === 'hurt' || mecha.anim === 'block') return;
  // 攻击中不转向
  if (mecha.anim === 'light_attack' || mecha.anim === 'heavy_attack' || mecha.anim === 'skill') return;
  const dx = opponent.pos.x - mecha.pos.x;
  mecha.facing = dx >= 0 ? 'right' : 'left';
}

/** 更新动画状态 */
function updateAnimation(mecha: MechaState, isMoving: boolean): void {
  // 优先动画在外部设置后不覆盖
  const priorityAnims: AnimationState[] = [
    'light_attack',
    'heavy_attack',
    'skill',
    'hurt',
    'dash',
    'jump',
    'air_attack',
    'slam_down',
    'block',
  ];

  if (priorityAnims.includes(mecha.anim)) return;

  if (isMoving) {
    mecha.anim = 'walk';
  } else {
    mecha.anim = 'idle';
  }
}

/** 更新机甲 */
export function updateMecha(
  mecha: MechaState,
  opponent: MechaState,
  moveLeft: boolean,
  moveRight: boolean,
  moveUp: boolean,
  moveDown: boolean,
  isBlocking: boolean,
  dt: number
): void {
  // hitstop 期间暂停
  if (mecha.hitstopTimer > 0) {
    mecha.hitstopTimer -= dt;
    return;
  }

  // 更新冷却
  if (mecha.lightCooldown > 0) mecha.lightCooldown -= dt;
  if (mecha.heavyCooldown > 0) mecha.heavyCooldown -= dt;
  if (mecha.skillCooldown > 0) mecha.skillCooldown -= dt;
  if (mecha.dashCooldown > 0) mecha.dashCooldown -= dt;
  if (mecha.slamCooldown > 0) mecha.slamCooldown -= dt;

  // 能量恢复
  mecha.ep = Math.min(mecha.maxEp, mecha.ep + 3 * dt);

  // 受击闪光
  if (mecha.hurtFlash) {
    mecha.hurtFlash = false;
  }

  // 攻击计时器
  if (mecha.attackTimer > 0) {
    mecha.attackTimer -= dt;
    if (mecha.attackTimer <= 0) {
      mecha.attackType = null;
      mecha.anim = 'idle';
    }
  }

  // 击退衰减
  if (Math.abs(mecha.knockback.x) > 1) {
    mecha.knockback.x *= 0.85;
  } else {
    mecha.knockback.x = 0;
  }
  if (Math.abs(mecha.knockback.y) > 1) {
    mecha.knockback.y *= 0.85;
  } else {
    mecha.knockback.y = 0;
  }

  // 冲刺逻辑
  if (mecha.isDashing) {
    mecha.dashTimer -= dt;
    if (mecha.dashTimer <= 0) {
      mecha.isDashing = false;
      mecha.invincible = false;
      mecha.anim = 'idle';
    } else {
      // 冲刺中移动
      mecha.pos.x += mecha.dashDir * (DASH_DISTANCE / DASH_DURATION) * dt;
      // 冲刺残影
      if (mecha.afterimages.length < 5) {
        mecha.afterimages.push({
          x: mecha.pos.x,
          y: mecha.pos.y,
          life: 0.15,
          maxLife: 0.15,
          facing: mecha.facing,
          anim: 'dash',
          animFrame: mecha.animFrame,
        });
      }
      mecha.pos.x = Math.max(0, Math.min(CANVAS_WIDTH - MECHA_WIDTH, mecha.pos.x));
      updateFacing(mecha, opponent);
      return;
    }
  }

  // 跳跃物理
  if (mecha.isJumping) {
    mecha.jumpVel += GRAVITY * dt;
    mecha.pos.y += mecha.jumpVel * dt;

    // 下落攻击：加速下落
    if (mecha.isSlamming) {
      mecha.jumpVel = Math.max(mecha.jumpVel, SLAM_SPEED * 0.5);
      mecha.anim = 'slam_down';
    }

    if (mecha.pos.y >= GROUND_Y - MECHA_HEIGHT) {
      mecha.pos.y = GROUND_Y - MECHA_HEIGHT;
      mecha.isJumping = false;
      mecha.jumpVel = 0;
      mecha.jumpCount = 0;
      mecha.canAirAttack = true;
      mecha.isSlamming = false;
      if (mecha.anim === 'jump' || mecha.anim === 'air_attack' || mecha.anim === 'slam_down') {
        mecha.anim = 'idle';
      }
    }
  }

  // 更新残影生命
  mecha.afterimages = mecha.afterimages.filter((a) => {
    a.life -= dt;
    return a.life > 0;
  });

  // 防御
  mecha.isBlocking = isBlocking;
  if (isBlocking && !mecha.isDashing) {
    mecha.anim = 'block';
  }

  // 移动
  const speed = isBlocking ? MECHA_BLOCK_SPEED : MECHA_SPEED;
  let vx = 0;
  let vy = 0;
  if (moveLeft) vx -= speed;
  if (moveRight) vx += speed;
  if (moveUp) vy -= speed;
  if (moveDown) vy += speed;

  mecha.vel.x = vx;
  mecha.vel.y = vy;

  const isMoving = vx !== 0 || vy !== 0;

  // 更新位置
  mecha.pos.x += vx * dt + mecha.knockback.x * dt;
  mecha.pos.y += vy * dt + mecha.knockback.y * dt;

  // 边界限制
  mecha.pos.x = Math.max(0, Math.min(CANVAS_WIDTH - MECHA_WIDTH, mecha.pos.x));
  mecha.pos.y = Math.max(0, Math.min(GROUND_Y - MECHA_HEIGHT, mecha.pos.y));

  // 更新面对方向
  updateFacing(mecha, opponent);

  // 更新动画
  updateAnimation(mecha, isMoving);

  // 更新动画帧
  mecha.animTimer += dt;
  if (mecha.animTimer >= ANIM_FRAME_DURATION) {
    mecha.animTimer -= ANIM_FRAME_DURATION;
    mecha.animFrame = (mecha.animFrame + 1) % ANIM_FRAME_COUNT;
  }
}

/** 触发冲刺 */
export function triggerDash(mecha: MechaState, dir: number): void {
  if (mecha.dashCooldown > 0 || mecha.isDashing) return;
  mecha.isDashing = true;
  mecha.dashTimer = DASH_DURATION;
  mecha.dashCooldown = DASH_COOLDOWN;
  mecha.dashDir = dir;
  mecha.invincible = true;
  mecha.anim = 'dash';
  mecha.animFrame = 0;
  mecha.animTimer = 0;
}

/** 触发轻攻击 */
export function triggerLightAttack(mecha: MechaState): boolean {
  if (mecha.lightCooldown > 0 || mecha.isDashing || mecha.isBlocking) return false;
  mecha.anim = 'light_attack';
  mecha.animFrame = 0;
  mecha.animTimer = 0;
  mecha.lightCooldown = 0.4;
  mecha.attackType = 'light';
  mecha.attackHit = false;
  mecha.attackTimer = 0.3;
  return true;
}

/** 触发重攻击 */
export function triggerHeavyAttack(mecha: MechaState): boolean {
  if (mecha.heavyCooldown > 0 || mecha.isDashing || mecha.isBlocking) return false;
  mecha.anim = 'heavy_attack';
  mecha.animFrame = 0;
  mecha.animTimer = 0;
  mecha.heavyCooldown = 0.8;
  mecha.attackType = 'heavy';
  mecha.attackHit = false;
  mecha.attackTimer = 0.5;
  return true;
}

/** 触发技能攻击 */
export function triggerSkill(mecha: MechaState): boolean {
  if (mecha.skillCooldown > 0 || mecha.isDashing || mecha.isBlocking || mecha.ep < 40) return false;
  mecha.anim = 'skill';
  mecha.animFrame = 0;
  mecha.animTimer = 0;
  mecha.skillCooldown = 2.0;
  mecha.ep -= 40;
  mecha.attackType = 'skill';
  mecha.attackHit = false;
  mecha.attackTimer = 0.4;
  return true;
}

/** 触发跳跃（支持二连跳） */
export function triggerJump(mecha: MechaState): boolean {
  if (mecha.isDashing || mecha.isBlocking) return false;

  // 地面起跳
  if (!mecha.isJumping) {
    mecha.isJumping = true;
    mecha.jumpVel = JUMP_VELOCITY;
    mecha.jumpCount = 1;
    mecha.anim = 'jump';
    mecha.animFrame = 0;
    mecha.animTimer = 0;
    mecha.canAirAttack = true;
    mecha.isSlamming = false;
    return true;
  }

  // 空中二连跳
  if (mecha.isJumping && mecha.jumpCount < mecha.maxJumps && !mecha.isSlamming) {
    mecha.jumpVel = DOUBLE_JUMP_VELOCITY;
    mecha.jumpCount = 2;
    mecha.anim = 'jump';
    mecha.animFrame = 0;
    mecha.animTimer = 0;
    mecha.canAirAttack = true;
    return true;
  }

  return false;
}

/** 触发下落攻击 */
export function triggerSlamAttack(mecha: MechaState): boolean {
  if (!mecha.isJumping || mecha.isSlamming || mecha.slamCooldown > 0) return false;
  mecha.isSlamming = true;
  mecha.jumpVel = SLAM_SPEED;
  mecha.slamCooldown = SLAM_COOLDOWN;
  mecha.anim = 'slam_down';
  mecha.animFrame = 0;
  mecha.animTimer = 0;
  mecha.attackType = 'heavy';
  mecha.attackHit = false;
  mecha.attackTimer = 0.3;
  return true;
}

/** 触发空中攻击 */
export function triggerAirAttack(mecha: MechaState): boolean {
  if (!mecha.isJumping || !mecha.canAirAttack) return false;
  if (mecha.lightCooldown > 0) return false;
  mecha.anim = 'air_attack';
  mecha.animFrame = 0;
  mecha.animTimer = 0;
  mecha.attackType = 'light';
  mecha.attackHit = false;
  mecha.attackTimer = 0.3;
  mecha.lightCooldown = 0.3;
  mecha.canAirAttack = false;
  return true;
}

/** 重置机甲为回合开始状态 */
export function resetMechaForRound(mecha: MechaState, x: number): void {
  mecha.pos.x = x;
  mecha.pos.y = GROUND_Y - MECHA_HEIGHT;
  mecha.hp = HP_MAX;
  mecha.ep = 0;
  mecha.vel = { x: 0, y: 0 };
  mecha.isBlocking = false;
  mecha.isDashing = false;
  mecha.anim = 'idle';
  mecha.animFrame = 0;
  mecha.animTimer = 0;
  mecha.lightCooldown = 0;
  mecha.heavyCooldown = 0;
  mecha.skillCooldown = 0;
  mecha.dashCooldown = 0;
  mecha.attackType = null;
  mecha.attackTimer = 0;
  mecha.attackHit = false;
  mecha.hitstopTimer = 0;
  mecha.hurtFlash = false;
  mecha.invincible = false;
  mecha.combo = 0;
  mecha.knockback = { x: 0, y: 0 };
  mecha.afterimages = [];
  mecha.facing = mecha.id === 'p1' ? 'right' : 'left';
  mecha.isJumping = false;
  mecha.jumpVel = 0;
  mecha.canAirAttack = true;
  mecha.jumpCount = 0;
  mecha.isSlamming = false;
  mecha.slamCooldown = 0;
}