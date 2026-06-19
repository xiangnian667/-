/* ===== Zustand 游戏状态管理 ===== */

import { create } from 'zustand';
import type { GamePhase, GameMode, MapType } from '../game/types';

interface AppStore {
  phase: GamePhase;
  gameWinner: string | null;
  gameMode: GameMode;
  mapType: MapType;
  setPhase: (phase: GamePhase) => void;
  setGameWinner: (winner: string | null) => void;
  setGameMode: (mode: GameMode) => void;
  setMapType: (mapType: MapType) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  phase: 'menu',
  gameWinner: null,
  gameMode: 'pvp',
  mapType: 'city',
  setPhase: (phase) => set({ phase }),
  setGameWinner: (winner) => set({ gameWinner: winner }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setMapType: (mapType) => set({ mapType }),
  reset: () => set({ phase: 'menu', gameWinner: null }),
}));