/* ===== 回合管理系统 ===== */

import type { MechaState, GamePhase } from '../types';
import {
  CANVAS_WIDTH,
  MECHA_WIDTH,
  ROUND_COUNTDOWN,
  ROUND_REST,
  ROUNDS_TO_WIN,
} from '../constants';
import { resetMechaForRound } from '../entities/mecha';

/** 检查回合是否结束 */
export function checkRoundEnd(
  p1: MechaState,
  p2: MechaState
): 'p1' | 'p2' | null {
  if (p1.hp <= 0) return 'p2';
  if (p2.hp <= 0) return 'p1';
  return null;
}

/** 检查游戏是否结束 */
export function checkGameEnd(
  p1: MechaState,
  p2: MechaState
): 'p1' | 'p2' | null {
  if (p1.roundsWon >= ROUNDS_TO_WIN) return 'p1';
  if (p2.roundsWon >= ROUNDS_TO_WIN) return 'p2';
  return null;
}

/** 开始新回合 */
export function startNewRound(
  p1: MechaState,
  p2: MechaState
): { phase: GamePhase; countdown: number } {
  const p1StartX = CANVAS_WIDTH * 0.25 - MECHA_WIDTH / 2;
  const p2StartX = CANVAS_WIDTH * 0.75 - MECHA_WIDTH / 2;
  resetMechaForRound(p1, p1StartX);
  resetMechaForRound(p2, p2StartX);
  return { phase: 'countdown', countdown: ROUND_COUNTDOWN };
}

/** 回合结束处理 */
export function handleRoundEnd(
  winner: 'p1' | 'p2',
  p1: MechaState,
  p2: MechaState
): { phase: GamePhase; roundWinner: string; gameWinner: string | null } {
  if (winner === 'p1') {
    p1.roundsWon++;
  } else {
    p2.roundsWon++;
  }

  const gameEnd = checkGameEnd(p1, p2);

  return {
    phase: 'round_end',
    roundWinner: winner,
    gameWinner: gameEnd,
  };
}