/* ===== 键盘输入管理器 ===== */

import { P1_KEYS, P2_KEYS } from './constants';
import type { InputState } from './types';

const keyMap: Record<string, boolean> = {};
const keyJustPressed: Record<string, boolean> = {};
const keyLastState: Record<string, boolean> = {};

export function initInput(): void {
  window.addEventListener('keydown', (e) => {
    if (!keyMap[e.code]) {
      keyJustPressed[e.code] = true;
    }
    keyMap[e.code] = true;
    keyLastState[e.code] = true;
    // 防止方向键滚动页面
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
}

export function getInputState(player: 'p1' | 'p2'): InputState {
  const keys = player === 'p1' ? P1_KEYS : P2_KEYS;
  return {
    up: isKeyDown(keys.up),
    down: isKeyDown(keys.down),
    left: isKeyDown(keys.left),
    right: isKeyDown(keys.right),
    lightAttack: isKeyJustPressed(keys.lightAttack),
    heavyAttack: isKeyJustPressed(keys.heavyAttack),
    block: isKeyDown(keys.block),
  };
}

export function isAnyKeyPressed(): boolean {
  return Object.values(keyJustPressed).some((v) => v);
}