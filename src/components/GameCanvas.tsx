/* ===== Canvas 包装组件 ===== */

import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import type { GameMode, MapType } from '../game/types';
import TouchControls from './TouchControls';

interface GameCanvasProps {
  onGameEnd: (winner: string) => void;
  mode?: GameMode;
  mapType?: MapType;
}

export default function GameCanvas({ onGameEnd, mode = 'pvp', mapType = 'city' }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [scale, setScale] = useState(1);

  // 自适应缩放——保证 HUD 始终可见
  useEffect(() => {
    const resize = () => {
      const maxW = window.innerWidth;
      const maxH = window.innerHeight;
      const scaleX = maxW / 960;
      const scaleY = maxH / 640;
      setScale(Math.min(scaleX, scaleY, 1.0));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, mode, mapType);
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
  }, [mode, mapType, onGameEnd]);

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
        className="block mx-auto"
        style={{
          width: 960 * scale,
          height: 640 * scale,
          imageRendering: 'pixelated',
        }}
      />
      <TouchControls playerId="p1" />
      {mode === 'pvp' && <TouchControls playerId="p2" />}
    </div>
  );
}