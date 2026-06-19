/* ===== 键盘 + 触屏输入管理器 ===== */

import { P1_KEYS, P2_KEYS } from './constants';
import type { InputState } from './types';

const keyMap: Record<string, boolean> = {};
const keyJustPressed: Record<string, boolean> = {};
const keyLastState: Record<string, boolean> = {};

// 外部输入（用于 AI 和触屏）
let externalInputs: Record<string, InputState> = {
  p1: { up: false, down: false, left: false, right: false, lightAttack: false, heavyAttack: false, block: false, dash: false, jump: false },
  p2: { up: false, down: false, left: false, right: false, lightAttack: false, heavyAttack: false, block: false, dash: false, jump: false },
};

// 触屏手动按下标志
let touchJustPressed: Record<string, Record<string, boolean>> = {
  p1: { lightAttack: false, heavyAttack: false, block: false, dash: false, jump: false },
  p2: { lightAttack: false, heavyAttack: false, block: false, dash: false, jump: false },
};

export function initInput(): void {
  window.addEventListener('keydown', (e) => {
    if (!keyMap[e.code]) {
      keyJustPressed[e.code] = true;
    }
    keyMap[e.code] = true;
    keyLastState[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keyMap[e.code] = false;
    keyLastState[e.code] = false;
  });

  window.addEventListener('blur', () => {
    for (const key in keyMap) {
      keyMap[key] = false;
      keyLastState[key] = false;
    }
  });
}

export function isKeyDown(code: string): boolean {
  return keyMap[code] === true;
}

export function isKeyJustPressed(code: string): boolean {
  return keyJustPressed[code] === true;
}

export function clearJustPressed(): void {
  for (const key in keyJustPressed) {
    keyJustPressed[key] = false;
  }
  // 清理触屏按下
  for (const player of ['p1', 'p2']) {
    for (const key in touchJustPressed[player]) {
      touchJustPressed[player][key] = false;
    }
  }
}

/** 设置外部输入（AI 或触屏） */
export function setExternalInput(player: 'p1' | 'p2', input: Partial<InputState>): void {
  Object.assign(externalInputs[player], input);
}

/** 重置外部输入 */
export function resetExternalInput(player: 'p1' | 'p2'): void {
  externalInputs[player] = {
    up: false, down: false, left: false, right: false,
    lightAttack: false, heavyAttack: false, block: false, dash: false, jump: false,
  };
}

/** 触屏模拟按键按下（仅一帧有效，类似键盘 justPressed） */
export function touchPress(player: 'p1' | 'p2', action: 'lightAttack' | 'heavyAttack' | 'block' | 'dash' | 'jump'): void {
  touchJustPressed[player][action] = true;
}

/** 触屏方向输入 */
export function touchDirection(player: 'p1' | 'p2', dx: number, dy: number): void {
  const input = externalInputs[player];
  input.left = dx < -0.3;
  input.right = dx > 0.3;
  input.up = dy < -0.3;
  input.down = dy > 0.3;
}

/** 获取输入状态 */
export function getInputState(player: 'p1' | 'p2'): InputState {
  const keys = player === 'p1' ? P1_KEYS : P2_KEYS;
  const ext = externalInputs[player];
  const tp = touchJustPressed[player];

  return {
    up: isKeyDown(keys.up) || ext.up,
    down: isKeyDown(keys.down) || ext.down,
    left: isKeyDown(keys.left) || ext.left,
    right: isKeyDown(keys.right) || ext.right,
    lightAttack: isKeyJustPressed(keys.lightAttack) || ext.lightAttack || tp.lightAttack,
    heavyAttack: isKeyJustPressed(keys.heavyAttack) || ext.heavyAttack || tp.heavyAttack,
    block: isKeyDown(keys.block) || ext.block,
    dash: tp.dash || ext.dash,
    jump: tp.jump || ext.jump,
  };
}

export function isAnyKeyPressed(): boolean {
  return Object.values(keyJustPressed).some((v) => v);
}