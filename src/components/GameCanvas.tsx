/* ===== Canvas 包装组件 ===== */

import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import type { GameMode } from '../game/types';
import TouchControls from './TouchControls';

interface GameCanvasProps {
  onGameEnd: (winner: string) => void;
  mode?: GameMode;
}

export default function GameCanvas({ onGameEnd, mode = 'pvp' }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, mode);
    engineRef.current = engine;

    engine.setOnStateChange((state) => {
      if (state.phase === 'result' && state.gameWinner) {
        onGameEnd(state.gameWinner);
      }
    });

    engine.start();

    return () => {
      engine.stop();
    };
  }, [mode, onGameEnd]);

  // ESC 暂停
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        engineRef.current?.togglePause();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        className="block mx-auto border-2 border-gray-700 rounded shadow-2xl"
        style={{
          width: '960px',
          height: '640px',
          maxWidth: '100vw',
          maxHeight: '100vh',
          imageRendering: 'pixelated',
        }}
      />
      {/* 触屏按键：PvP 时 P1 右边显示 P2 的键，PvE 时只显示 P1 的键 */}
      <TouchControls playerId="p1" />
      {mode === 'pvp' && <TouchControls playerId="p2" />}
    </div>
  );
}