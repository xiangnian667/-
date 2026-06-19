/* ===== 对战页面 ===== */

import { useCallback } from 'react';
import GameCanvas from '../components/GameCanvas';
import { useAppStore } from '../stores/gameStore';

export default function BattlePage() {
  const setPhase = useAppStore((s) => s.setPhase);
  const setGameWinner = useAppStore((s) => s.setGameWinner);
  const gameMode = useAppStore((s) => s.gameMode);
  const mapType = useAppStore((s) => s.mapType);

  const handleGameEnd = useCallback(
    (winner: string) => {
      setGameWinner(winner);
      setPhase('result');
    },
    [setPhase, setGameWinner]
  );

  return (
    <div className="w-screen h-screen bg-[#0d0d1a] overflow-hidden">
      <GameCanvas onGameEnd={handleGameEnd} mode={gameMode} mapType={mapType} />
    </div>
  );
}