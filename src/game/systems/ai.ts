/* ===== 人机对战 AI 系统（困难版） ===== */

import type { MechaState, InputState } from '../types';
import {
  MECHA_WIDTH,
  MECHA_HEIGHT,
  CANVAS_WIDTH,
  LIGHT_RANGE,
  HEAVY_RANGE,
  SKILL_RANGE,
  SKILL_EP_COST,
  AIR_ATTACK_RANGE,
} from '../constants';

type AIState = 'idle' | 'approach' | 'retreat' | 'aggressive' | 'defensive' | 'jump_attack';

export class AIController {
  private state: AIState = 'approach';
  private stateTimer: number = 0;
  private actionCooldown: number = 0;
  private comboCount: number = 0;
  private lastPlayerHp: number = 0;
  private dodgeTimer: number = 0;
  private predictionTimer: number = 0;

  constructor(difficulty: 'hard' = 'hard') {
    this.lastPlayerHp = 0;
  }

  private get reactionTime(): number {
    return 0.03 + Math.random() * 0.06; // 极快反应
  }

  private get aggression(): number {
    return 0.7; // 高攻击性
  }

  private distance(a: MechaState, b: MechaState): number {
    return Math.abs(a.pos.x - b.pos.x);
  }

  update(ai: MechaState, player: MechaState, dt: number): InputState {
    this.actionCooldown -= dt;
    this.stateTimer -= dt;
    this.dodgeTimer -= dt;
    this.predictionTimer -= dt;

    // 追踪玩家血量变化，检测玩家是否在攻击
    if (this.lastPlayerHp > player.hp) {
      this.dodgeTimer = 0.3; // 受到伤害后暂时后撤
    }
    this.lastPlayerHp = player.hp;

    const dist = this.distance(ai, player);
    const playerLeft = player.pos.x < ai.pos.x;

    // 状态机切换
    if (this.stateTimer <= 0) {
      this.chooseState(ai, player, dist);
      this.stateTimer = 0.15 + Math.random() * 0.3;
    }

    switch (this.state) {
      case 'idle': return this.idleBehavior();
      case 'approach': return this.approachBehavior(ai, player, dist, playerLeft);
      case 'retreat': return this.retreatBehavior(ai, player, dist, playerLeft);
      case 'aggressive': return this.aggressiveBehavior(ai, player, dist, playerLeft);
      case 'defensive': return this.defensiveBehavior(ai, player, dist, playerLeft);
      case 'jump_attack': return this.jumpAttackBehavior(ai, player, dist, playerLeft);
      default: return this.emptyInput();
    }
  }

  private chooseState(ai: MechaState, player: MechaState, dist: number): void {
    const hpRatio = ai.hp / ai.maxHp;
    const playerHpRatio = player.hp / player.maxHp;

    // 低血量：更激进的反击或防御
    if (hpRatio < 0.2 && !ai.isJumping) {
      this.state = Math.random() < 0.6 ? 'aggressive' : 'defensive';
      return;
    }

    // 玩家残血：猛攻
    if (playerHpRatio < 0.3) {
      this.state = Math.random() < 0.5 ? 'aggressive' : 'jump_attack';
      return;
    }

    // 最近受伤：后撤或防御
    if (this.dodgeTimer > 0 && !ai.isJumping) {
      this.state = Math.random() < 0.5 ? 'retreat' : 'defensive';
      return;
    }

    // 距离判断
    if (dist < LIGHT_RANGE) {
      // 近身：连击
      if (Math.random() < this.aggression) {
        this.state = 'aggressive';
      } else if (Math.random() < 0.4) {
        this.state = 'jump_attack';
      } else {
        this.state = 'defensive';
      }
    } else if (dist < HEAVY_RANGE * 1.3) {
      // 中距离：跳跃接近
      if (Math.random() < 0.5) {
        this.state = 'jump_attack';
      } else {
        this.state = Math.random() < this.aggression ? 'aggressive' : 'approach';
      }
    } else {
      // 远距离
      this.state = Math.random() < 0.6 ? 'approach' : 'jump_attack';
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

    if (dist > HEAVY_RANGE * 2 && this.actionCooldown <= 0 && Math.random() < 0.3) {
      input.dash = true;
      this.actionCooldown = 0.4;
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

    // 后退时偶尔跳跃后退
    if (!ai.isJumping && Math.random() < 0.2 && this.actionCooldown <= 0) {
      input.jump = true;
      this.actionCooldown = 0.3;
    }
    return input;
  }

  private aggressiveBehavior(ai: MechaState, player: MechaState, dist: number, playerLeft: boolean): InputState {
    const input = this.emptyInput();

    // 微调位置
    if (dist > LIGHT_RANGE * 0.7) {
      if (playerLeft) input.left = true;
      else input.right = true;
    }

    if (this.actionCooldown <= 0) {
      if (dist < LIGHT_RANGE) {
        // 近身：快速轻攻击连击
        input.lightAttack = true;
        this.comboCount++;
        this.actionCooldown = 0.08 + Math.random() * 0.05; // 极快连击
        if (this.comboCount >= 4) {
          // 连击后接重击
          input.heavyAttack = true;
          this.comboCount = 0;
          this.actionCooldown = 0.35;
        }
      } else if (dist < HEAVY_RANGE) {
        if (ai.ep >= SKILL_EP_COST && Math.random() < 0.5) {
          input.heavyAttack = true;
          this.actionCooldown = 0.4;
        } else if (Math.random() < 0.7) {
          input.heavyAttack = true;
          this.actionCooldown = 0.3;
        }
      }
    }

    // 冲刺接近
    if (dist > HEAVY_RANGE && this.actionCooldown <= 0 && Math.random() < 0.35) {
      input.dash = true;
      this.actionCooldown = 0.4;
    }

    return input;
  }

  private defensiveBehavior(ai: MechaState, player: MechaState, dist: number, playerLeft: boolean): InputState {
    const input = this.emptyInput();
    input.block = true;

    if (playerLeft) input.right = true;
    else input.left = true;

    // 防御后快速反击
    if (dist < LIGHT_RANGE && this.actionCooldown <= 0 && Math.random() < 0.5) {
      input.lightAttack = true;
      this.actionCooldown = 0.2;
    }

    // 防御时偶尔跳跃突围
    if (!ai.isJumping && Math.random() < 0.15 && this.actionCooldown <= 0) {
      input.jump = true;
      this.actionCooldown = 0.3;
    }

    return input;
  }

  private jumpAttackBehavior(ai: MechaState, player: MechaState, dist: number, playerLeft: boolean): InputState {
    const input = this.emptyInput();

    if (!ai.isJumping) {
      // 起跳
      input.jump = true;
      // 朝着玩家方向跳
      if (playerLeft) input.left = true;
      else input.right = true;
    } else {
      // 空中：继续朝玩家移动
      if (playerLeft) input.left = true;
      else input.right = true;

      // 空中攻击
      if (dist < AIR_ATTACK_RANGE * 1.5 && ai.canAirAttack && this.actionCooldown <= 0) {
        input.jump = true; // 空中按跳跃触发空中攻击
        this.actionCooldown = 0.3;
      }
    }

    return input;
  }

  reset(): void {
    this.state = 'approach';
    this.stateTimer = 0;
    this.actionCooldown = 0;
    this.comboCount = 0;
    this.lastPlayerHp = 0;
    this.dodgeTimer = 0;
    this.predictionTimer = 0;
  }

  private emptyInput(): InputState {
    return {
      up: false, down: false, left: false, right: false,
      lightAttack: false, heavyAttack: false, block: false, dash: false, jump: false,
    };
  }
}

export function createAIController(difficulty: 'hard' = 'hard'): AIController {
  return new AIController(difficulty);
}