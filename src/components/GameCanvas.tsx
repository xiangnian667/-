/* ===== Canvas 包装组件 ===== */

import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { useAppStore } from '../stores/gameStore';

interface GameCanvasProps {
  onGameEnd: (winner: string) => void;
}

export default function GameCanvas({ onGameEnd }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
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
  }, [onGameEnd]);

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
  );
}