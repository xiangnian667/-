/* ===== 主菜单页面 ===== */

import { useState } from 'react';
import { useAppStore } from '../stores/gameStore';
import type { GameMode, MapType } from '../game/types';

const MAPS: { id: MapType; label: string; emoji: string; desc: string }[] = [
  { id: 'city', label: '城市夜景', emoji: '🏙️', desc: '霓虹都市' },
  { id: 'desert', label: '沙漠', emoji: '🏜️', desc: '烈日荒漠' },
  { id: 'space', label: '太空站', emoji: '🚀', desc: '星际基地' },
  { id: 'dojo', label: '道场', emoji: '🏯', desc: '武士道场' },
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

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center p-4 gap-6">
      {/* 标题 */}
      <div className="text-center">
        <h1
          className="text-4xl mb-2 tracking-wider"
          style={{ fontFamily: "'Press Start 2P', monospace", color: '#ff3344' }}
        >
          MECHA
        </h1>
        <h1
          className="text-3xl tracking-wider"
          style={{ fontFamily: "'Press Start 2P', monospace", color: '#3399ff' }}
        >
          CLASH
        </h1>
        <div className="flex justify-center gap-3 mt-2">
          <span className="text-xs text-[#ff3344]" style={{ fontFamily: "'Press Start 2P', monospace" }}>赤红</span>
          <span className="text-xs text-gray-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>VS</span>
          <span className="text-xs text-[#3399ff]" style={{ fontFamily: "'Press Start 2P', monospace" }}>苍蓝</span>
        </div>
      </div>

      {/* 模式选择 */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedMode('pve')}
          className="cursor-pointer"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <span
            className={`block px-4 py-2 text-xs border-2 transition-all duration-200 ${
              selectedMode === 'pve'
                ? 'text-[#ffcc33] border-[#ffcc33] bg-[#2a2a4e]'
                : 'text-gray-500 border-gray-700 bg-[#1a1a2e]'
            }`}
            style={selectedMode === 'pve' ? { boxShadow: '0 0 10px rgba(255, 204, 51, 0.3)' } : {}}
          >
            🤖 人机对战
          </span>
        </button>
        <button
          onClick={() => setSelectedMode('pvp')}
          className="cursor-pointer"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <span
            className={`block px-4 py-2 text-xs border-2 transition-all duration-200 ${
              selectedMode === 'pvp'
                ? 'text-[#33ccff] border-[#33ccff] bg-[#2a2a4e]'
                : 'text-gray-500 border-gray-700 bg-[#1a1a2e]'
            }`}
            style={selectedMode === 'pvp' ? { boxShadow: '0 0 10px rgba(51, 204, 255, 0.3)' } : {}}
          >
            👥 双人对战
          </span>
        </button>
      </div>

      {/* 地图选择 */}
      <div className="text-center">
        <p className="text-gray-400 text-[8px] mb-3" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          选择地图
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {MAPS.map((map) => (
            <button
              key={map.id}
              onClick={() => setSelectedMap(map.id)}
              className="cursor-pointer"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              <span
                className={`block px-3 py-2 text-[9px] border-2 transition-all duration-200 ${
                  selectedMap === map.id
                    ? 'text-[#33ff99] border-[#33ff99] bg-[#1a2e1a]'
                    : 'text-gray-500 border-gray-700 bg-[#1a1a2e]'
                }`}
                style={selectedMap === map.id ? { boxShadow: '0 0 8px rgba(51, 255, 153, 0.2)' } : {}}
              >
                {map.emoji} {map.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 触屏操作说明 */}
      <div className="text-center">
        <p className="text-gray-400 text-[8px] mb-3" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          操作说明
        </p>
        <div className="border border-gray-800 bg-[#0a0a15] p-4 max-w-xs">
          <div className="grid grid-cols-2 gap-3 text-[9px]" style={{ fontFamily: 'monospace' }}>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="inline-block w-8 h-8 rounded-full border border-gray-500 bg-white/10 flex items-center justify-center text-[10px]">🕹</span>
              <span className="text-left">摇杆移动</span>
            </div>
            <div className="flex items-center gap-2 text-[#ffc850]">
              <span className="inline-block w-8 h-8 rounded-full border border-[#ffc850]/50 bg-[#ffc850]/10 flex items-center justify-center text-[10px]">轻</span>
              <span className="text-left">轻攻击</span>
            </div>
            <div className="flex items-center gap-2 text-[#ff5032]">
              <span className="inline-block w-8 h-8 rounded-full border border-[#ff5032]/50 bg-[#ff5032]/10 flex items-center justify-center text-[10px]">重</span>
              <span className="text-left">重攻击/技能</span>
            </div>
            <div className="flex items-center gap-2 text-[#32b4ff]">
              <span className="inline-block w-8 h-8 rounded-full border border-[#32b4ff]/50 bg-[#32b4ff]/10 flex items-center justify-center text-[10px]">防</span>
              <span className="text-left">防御</span>
            </div>
            <div className="flex items-center gap-2 text-[#32ff78]">
              <span className="inline-block w-8 h-8 rounded-full border border-[#32ff78]/50 bg-[#32ff78]/10 flex items-center justify-center text-[10px]">冲</span>
              <span className="text-left">冲刺</span>
            </div>
            <div className="flex items-center gap-2 text-[#cc88ff]">
              <span className="inline-block w-8 h-8 rounded-full border border-[#cc88ff]/50 bg-[#cc88ff]/10 flex items-center justify-center text-[10px]">跳</span>
              <span className="text-left">跳跃/空中攻击</span>
            </div>
          </div>
        </div>
      </div>

      {/* 开始按钮 */}
      <button
        onClick={handleStart}
        className="cursor-pointer group"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        <span
          className="block px-8 py-3 text-sm border-2 border-[#ffcc33] text-[#ffcc33] hover:bg-[#ffcc33] hover:text-[#0d0d1a] transition-all duration-200"
          style={{ boxShadow: '0 0 15px rgba(255, 204, 51, 0.3)' }}
        >
          开始游戏
        </span>
      </button>
    </div>
  );
}