/* ===== Canvas 包装组件 ===== */

import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import type { GameMode, MapType } from '../game/types';
import TouchControls from './TouchControls';

const CANVAS_W = 960;
const CANVAS_H = 640;

interface GameCanvasProps {
  onGameEnd: (winner: string) => void;
  mode?: GameMode;
  mapType?: MapType;
}

export default function GameCanvas({ onGameEnd, mode = 'pvp', mapType = 'city' }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [scale, setScale] = useState(1);

  // 自适应缩放——保证画布完整可见（含血条 HUD）
  useEffect(() => {
    const resize = () => {
      const maxW = window.innerWidth;
      const maxH = window.innerHeight;
      const scaleX = maxW / CANVAS_W;
      const scaleY = maxH / CANVAS_H;
      setScale(Math.min(scaleX, scaleY));
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

  const canvasStyle: React.CSSProperties = {
    width: CANVAS_W * scale,
    height: CANVAS_H * scale,
    imageRendering: 'pixelated',
    display: 'block',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#0d0d1a' }}>
      <canvas
        ref={canvasRef}
        style={canvasStyle}
      />
      <TouchControls playerId="p1" />
      {mode === 'pvp' && <TouchControls playerId="p2" />}
    </div>
  );
}