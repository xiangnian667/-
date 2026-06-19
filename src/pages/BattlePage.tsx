/* ===== 对战页面 ===== */

import { useCallback } from 'react';
import GameCanvas from '../components/GameCanvas';
import { useAppStore } from '../stores/gameStore';

export default function BattlePage() {
  const setPhase = useAppStore((s) => s.setPhase);
  const setGameWinner = useAppStore((s) => s.setGameWinner);

  const handleGameEnd = useCallback(
    (winner: string) => {
      setGameWinner(winner);
      setPhase('result');
    },
    [setPhase, setGameWinner]
  );

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-2">
        <GameCanvas onGameEnd={handleGameEnd} />
        <p
          className="text-gray-500 text-[8px]"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          Press ESC to pause
        </p>
      </div>
    </div>
  );
}