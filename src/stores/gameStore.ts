/* ===== Zustand 游戏状态管理 ===== */

import { create } from 'zustand';
import type { GamePhase, GameMode } from '../game/types';

interface AppStore {
  phase: GamePhase;
  gameWinner: string | null;
  gameMode: GameMode;
  setPhase: (phase: GamePhase) => void;
  setGameWinner: (winner: string | null) => void;
  setGameMode: (mode: GameMode) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  phase: 'menu',
  gameWinner: null,
  gameMode: 'pvp',
  setPhase: (phase) => set({ phase }),
  setGameWinner: (winner) => set({ gameWinner: winner }),
  setGameMode: (mode) => set({ gameMode: mode }),
  reset: () => set({ phase: 'menu', gameWinner: null }),
}));