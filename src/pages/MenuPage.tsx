/* ===== 主菜单页面 ===== */

import { useState } from 'react';
import { useAppStore } from '../stores/gameStore';
import type { GameMode, MapType } from '../game/types';

const MAPS: { id: MapType; label: string; desc: string }[] = [
  { id: 'city', label: '城市夜景', desc: '霓虹都市' },
  { id: 'desert', label: '沙漠', desc: '烈日荒漠' },
  { id: 'space', label: '太空站', desc: '星际基地' },
  { id: 'dojo', label: '道场', desc: '武士道场' },
];

export default function MenuPage() {
  const setPhase = useAppStore((s) => s.setPhase);
  const setGameMode = useAppStore((s) => s.setGameMode);
  const setMapType = useAppStore((s) => s.setMapType);
  const [selectedMode, setSelectedMode] = useState<GameMode>('pve');
  const [selectedMap, setSelectedMap] = useState<MapType>('city');

  const handleStart = () => {
    setGameMode(selectedMode);
    setMapType(selectedMap);
    setPhase('battle');
  };

  const btnBase = (active: boolean, accent: string): React.CSSProperties => ({
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 10,
    padding: '8px 14px',
    border: `2px solid ${active ? accent : '#333355'}`,
    background: active ? '#1a1a3e' : '#0d0d1a',
    color: active ? accent : '#555577',
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: active ? `0 0 12px ${accent}33` : 'none',
    textShadow: active ? `0 0 8px ${accent}66` : 'none',
    letterSpacing: 1,
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 select-none"
      style={{ background: 'linear-gradient(180deg, #0a0a18 0%, #0d0d1a 50%, #0f0f20 100%)' }}
    >
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #ff3344, #ff334400 30%, #3399ff00 70%, #3399ff)' }} />

      {/* 标题区域 */}
      <div className="text-center relative">
        {/* 像素装饰 */}
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2"
              style={{
                background: i < 4 ? '#ff3344' : i > 4 ? '#3399ff' : '#ffcc33',
                opacity: 0.6 + Math.sin(i * 0.8) * 0.3,
              }}
            />
          ))}
        </div>

        <h1
          className="text-5xl tracking-widest mb-1 leading-tight"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: '#ff3344',
            textShadow: '0 0 20px rgba(255,51,68,0.5), 0 4px 0 #661122',
          }}
        >
          MECHA
        </h1>
        <h1
          className="text-4xl tracking-widest leading-tight"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: '#3399ff',
            textShadow: '0 0 20px rgba(51,153,255,0.5), 0 4px 0 #112266',
          }}
        >
          CLASH
        </h1>

        <div className="flex justify-center items-center gap-4 mt-3">
          <span
            className="text-xs px-2 py-0.5 border"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              color: '#ff3344',
              borderColor: '#ff334444',
              background: '#ff334411',
            }}
          >
            赤红
          </span>
          <span
            className="text-xs"
            style={{ fontFamily: "'Press Start 2P', monospace", color: '#ffcc33' }}
          >
            VS
          </span>
          <span
            className="text-xs px-2 py-0.5 border"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              color: '#3399ff',
              borderColor: '#3399ff44',
              background: '#3399ff11',
            }}
          >
            苍蓝
          </span>
        </div>

        <div
          className="text-[8px] mt-2"
          style={{ fontFamily: "'Press Start 2P', monospace", color: '#444466' }}
        >
          v1.6.0
        </div>
      </div>

      {/* 模式选择 */}
      <div className="flex gap-3">
        <button onClick={() => setSelectedMode('pve')} style={btnBase(selectedMode === 'pve', '#ffcc33')}>
          人机对战
        </button>
        <button onClick={() => setSelectedMode('pvp')} style={btnBase(selectedMode === 'pvp', '#33ccff')}>
          双人对战
        </button>
      </div>

      {/* 地图选择 */}
      <div className="text-center">
        <p
          className="text-[9px] mb-3"
          style={{ fontFamily: "'Press Start 2P', monospace", color: '#555577' }}
        >
          — 选择地图 —
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {MAPS.map((map) => (
            <button
              key={map.id}
              onClick={() => setSelectedMap(map.id)}
              style={btnBase(selectedMap === map.id, '#33ff99')}
            >
              {map.label}
            </button>
          ))}
        </div>
      </div>

      {/* 操作说明 - 简洁版 */}
      <div className="text-center">
        <p
          className="text-[9px] mb-3"
          style={{ fontFamily: "'Press Start 2P', monospace", color: '#555577' }}
        >
          — 触屏操作 —
        </p>
        <div
          className="inline-block border px-4 py-3"
          style={{ borderColor: '#222244', background: '#060612' }}
        >
          <div
            className="grid grid-cols-2 gap-x-6 gap-y-2 text-[9px]"
            style={{ fontFamily: 'monospace' }}
          >
            <span style={{ color: '#777799' }}>摇杆</span>
            <span style={{ color: '#aaaacc' }}>移动</span>
            <span style={{ color: '#ffc850' }}>普攻</span>
            <span style={{ color: '#aaaacc' }}>攻击/空中下落</span>
            <span style={{ color: '#cc88ff' }}>跳跃</span>
            <span style={{ color: '#aaaacc' }}>跳跃/二连跳</span>
            <span style={{ color: '#ff5032' }}>重攻</span>
            <span style={{ color: '#aaaacc' }}>重击/技能</span>
            <span style={{ color: '#32b4ff' }}>防御</span>
            <span style={{ color: '#aaaacc' }}>格挡减伤</span>
            <span style={{ color: '#32ff78' }}>冲刺</span>
            <span style={{ color: '#aaaacc' }}>无敌帧位移</span>
          </div>
        </div>
      </div>

      {/* 开始按钮 */}
      <button
        onClick={handleStart}
        className="active:translate-y-0.5 active:shadow-none transition-all"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 14,
          padding: '14px 40px',
          border: '2px solid #ffcc33',
          background: 'linear-gradient(180deg, #2a2a0a 0%, #1a1a00 100%)',
          color: '#ffcc33',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(255,204,51,0.3), 0 4px 0 #886600',
          textShadow: '0 0 10px rgba(255,204,51,0.5)',
          letterSpacing: 3,
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        开始游戏
      </button>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #3399ff, #3399ff00 70%, #ff334400 30%, #ff3344)' }} />
    </div>
  );
}