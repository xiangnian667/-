/* ===== Zustand 游戏状态管理 ===== */

import { create } from 'zustand';
import type { GamePhase } from '../game/types';

interface AppStore {
  phase: GamePhase;
  gameWinner: string | null;
  setPhase: (phase: GamePhase) => void;
  setGameWinner: (winner: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  phase: 'menu',
  gameWinner: null,
  setPhase: (phase) => set({ phase }),
  setGameWinner: (winner) => set({ gameWinner: winner }),
  reset: () => set({ phase: 'menu', gameWinner: null }),
}));