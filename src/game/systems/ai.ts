/* ===== 人机对战 AI 系统 ===== */

import type { MechaState, InputState } from '../types';
import {
  MECHA_WIDTH,
  MECHA_HEIGHT,
  CANVAS_WIDTH,
  LIGHT_RANGE,
  HEAVY_RANGE,
  SKILL_RANGE,
  SKILL_EP_COST,
} from '../constants';

type AIState = 'idle' | 'approach' | 'retreat' | 'aggressive' | 'defensive';

export class AIController {
  private state: AIState = 'approach';
  private stateTimer: number = 0;
  private actionCooldown: number = 0;
  private reactionDelay: number = 0;
  private targetX: number = 0;
  private difficulty: 'easy' | 'normal' | 'hard';

  constructor(difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
    this.difficulty = difficulty;
  }

  /** 根据难度返回反应延迟 */
  private get reactionTime(): number {
    switch (this.difficulty) {
      case 'easy': return 0.4 + Math.random() * 0.3;
      case 'normal': return 0.15 + Math.random() * 0.2;
      case 'hard': return 0.05 + Math.random() * 0.1;
    }
  }

  /** 根据难度返回攻击积极性 */
  private get aggression(): number {
    switch (this.difficulty) {
      case 'easy': return 0.25;
      case 'normal': return 0.45;
      case 'hard': return 0.65;
    }
  }

  /** 距离计算 */
  private distance(a: MechaState, b: MechaState): number {
    return Math.abs(a.pos.x - b.pos.x);
  }

  /** 每帧更新 AI 决策 */
  update(ai: MechaState, player: MechaState, dt: number): InputState {
    this.actionCooldown -= dt;
    this.reactionDelay -= dt;
    this.stateTimer -= dt;

    const dist = this.distance(ai, player);
    const playerLeft = player.pos.x < ai.pos.x;

    // 状态机切换
    if (this.stateTimer <= 0) {
      this.chooseState(ai, player, dist);
      this.stateTimer = 0.3 + Math.random() * 0.7;
    }

    // 根据状态生成输入
    switch (this.state) {
      case 'idle': return this.idleBehavior();
      case 'approach': return this.approachBehavior(ai, player, dist, playerLeft);
      case 'retreat': return this.retreatBehavior(ai, player, dist, playerLeft);
      case 'aggressive': return this.aggressiveBehavior(ai, player, dist, playerLeft);
      case 'defensive': return this.defensiveBehavior(ai, player, dist, playerLeft);
      default: return this.emptyInput();
    }
  }

  private chooseState(ai: MechaState, player: MechaState, dist: number): void {
    const hpRatio = ai.hp / ai.maxHp;
    const playerHpRatio = player.hp / player.maxHp;

    // 低血量时更倾向于防御
    if (hpRatio < 0.3) {
      this.state = Math.random() < 0.5 ? 'defensive' : 'retreat';
      return;
    }

    // 玩家残血时追击
    if (playerHpRatio < 0.25 && Math.random() < this.aggression + 0.2) {
      this.state = 'aggressive';
      return;
    }

    // 距离判断
    if (dist < LIGHT_RANGE) {
      // 近身：攻击或防御
      if (Math.random() < this.aggression) {
        this.state = 'aggressive';
      } else {
        this.state = Math.random() < 0.5 ? 'defensive' : 'retreat';
      }
    } else if (dist < HEAVY_RANGE * 1.5) {
      // 中距离：接近或攻击
      this.state = Math.random() < this.aggression + 0.1 ? 'aggressive' : 'approach';
    } else {
      // 远距离：接近
      this.state = 'approach';
    }
  }

  private idleBehavior(): InputState {
    return this.emptyInput();
  }

  private approachBehavior(ai: MechaState, player: MechaState, dist: number, playerLeft: boolean): InputState {
    const input = this.emptyInput();
    if (playerLeft) {
      input.left = true;
    } else {
      input.right = true;
    }

    // 偶尔冲刺接近
    if (dist > HEAVY_RANGE * 2 && this.actionCooldown <= 0 && Math.random() < 0.15) {
      this.actionCooldown = 0.5;
      // 冲刺由引擎的双击检测处理，这里模拟方向键双击
      input.dash = true;
    }

    return input;
  }

  private retreatBehavior(ai: MechaState, player: MechaState, dist: number, playerLeft: boolean): InputState {
    const input = this.emptyInput();
    if (playerLeft) {
      input.right = true;
    } else {
      input.left = true;
    }
    return input;
  }

  private aggressiveBehavior(ai: MechaState, player: MechaState, dist: number, playerLeft: boolean): InputState {
    const input = this.emptyInput();

    // 保持面向玩家
    if (dist > LIGHT_RANGE * 0.8) {
      if (playerLeft) {
        input.left = true;
      } else {
        input.right = true;
      }
    }

    // 攻击决策
    if (this.actionCooldown <= 0) {
      if (dist < LIGHT_RANGE) {
        // 近身：轻攻击连击
        input.lightAttack = true;
        this.actionCooldown = 0.15 + Math.random() * 0.1;
      } else if (dist < HEAVY_RANGE) {
        if (ai.ep >= SKILL_EP_COST && Math.random() < 0.4) {
          input.heavyAttack = true; // 触发技能
          this.actionCooldown = 0.5;
        } else if (Math.random() < 0.6) {
          input.heavyAttack = true;
          this.actionCooldown = 0.4;
        }
      }
    }

    // 冲刺接近
    if (dist > HEAVY_RANGE && this.actionCooldown <= 0 && Math.random() < 0.2) {
      input.dash = true;
      this.actionCooldown = 0.5;
    }

    return input;
  }

  private defensiveBehavior(ai: MechaState, player: MechaState, dist: number, playerLeft: boolean): InputState {
    const input = this.emptyInput();

    // 防御
    input.block = true;

    // 小步后退
    if (playerLeft) {
      input.right = true;
    } else {
      input.left = true;
    }

    // 偶尔反击
    if (dist < LIGHT_RANGE && this.actionCooldown <= 0 && Math.random() < 0.3) {
      input.lightAttack = true;
      this.actionCooldown = 0.3;
    }

    return input;
  }

  reset(): void {
    this.state = 'approach';
    this.stateTimer = 0;
    this.actionCooldown = 0;
    this.reactionDelay = 0;
  }

  private emptyInput(): InputState {
    return {
      up: false,
      down: false,
      left: false,
      right: false,
      lightAttack: false,
      heavyAttack: false,
      block: false,
      dash: false,
    };
  }
}

/** 工厂函数 */
export function createAIController(difficulty: 'easy' | 'normal' | 'hard' = 'normal'): AIController {
  return new AIController(difficulty);
}