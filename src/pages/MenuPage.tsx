/* ===== 主菜单页面 ===== */

import { useAppStore } from '../stores/gameStore';

export default function MenuPage() {
  const setPhase = useAppStore((s) => s.setPhase);

  const handleStart = () => {
    setPhase('battle');
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center font-['Press_Start_2P'] relative overflow-hidden">
      {/* 背景网格 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(#334466 1px, transparent 1px), linear-gradient(90deg, #334466 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 背景粒子 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 3 === 0 ? '#ff3333' : i % 3 === 1 ? '#3399ff' : '#334466',
              animation: `float ${3 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.5,
            }}
          />
        ))}
      </div>

      {/* 标题 */}
      <div className="relative z-10 mb-8">
        <h1
          className="text-5xl font-bold text-center tracking-wider animate-pulse"
          style={{
            color: '#ffcc33',
            textShadow: '0 0 20px #ff9933, 0 0 40px #ff6633, 0 0 80px #ff3333',
            animation: 'titleFloat 2s ease-in-out infinite',
          }}
        >
          MECHA
        </h1>
        <h2
          className="text-3xl font-bold text-center mt-2 tracking-widest"
          style={{
            color: '#ff6633',
            textShadow: '0 0 10px #ff3333, 0 0 30px #ff3333',
            animation: 'titleFloat 2s ease-in-out 0.3s infinite',
          }}
        >
          CLASH
        </h2>
      </div>

      {/* 机甲展示 */}
      <div className="relative z-10 flex items-center gap-32 mb-10">
        {/* P1 机甲示意 */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-20 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-16 bg-[#cc2222] relative">
                <div className="absolute top-0 left-1 w-2 h-1 bg-[#ff9933]" />
                <div className="absolute top-0 right-1 w-2 h-1 bg-[#ff9933]" />
                <div className="absolute top-1 left-2 w-8 h-1 bg-[#ffdd00]" />
                <div className="absolute top-3 left-1 w-3 h-3 bg-[#ff4444]" />
                <div className="absolute top-3 right-1 w-3 h-3 bg-[#ff4444]" />
                <div className="absolute top-6 left-2 w-8 h-5 bg-[#881111]" />
                <div className="absolute bottom-0 left-2 w-3 h-5 bg-[#881111]" />
                <div className="absolute bottom-0 right-2 w-3 h-5 bg-[#881111]" />
              </div>
            </div>
          </div>
          <span className="text-[#ff3333] text-xs" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            P1
          </span>
        </div>

        <div className="text-[#ffcc33] text-2xl" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          VS
        </div>

        {/* P2 机甲示意 */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-20 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-16 bg-[#2255cc] relative">
                <div className="absolute top-0 left-2 w-8 h-1 bg-[#33ccff]" />
                <div className="absolute top-1 left-2 w-8 h-1 bg-[#00ddff]" />
                <div className="absolute top-3 left-1 w-3 h-3 bg-[#4488ff]" />
                <div className="absolute top-3 right-1 w-3 h-3 bg-[#4488ff]" />
                <div className="absolute top-6 left-2 w-8 h-5 bg-[#113388]" />
                <div className="absolute bottom-0 left-2 w-3 h-5 bg-[#113388]" />
                <div className="absolute bottom-0 right-2 w-3 h-5 bg-[#113388]" />
              </div>
            </div>
          </div>
          <span className="text-[#3399ff] text-xs" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            P2
          </span>
        </div>
      </div>

      {/* 操作说明 */}
      <div className="relative z-10 flex gap-16 mb-8">
        <div
          className="border-2 border-[#ff3333]/40 bg-[#0d0d1a]/80 p-4"
          style={{ minWidth: 200 }}
        >
          <h3 className="text-[#ff3333] text-xs mb-3 text-center" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            PLAYER 1
          </h3>
          <div className="space-y-1.5 text-[10px] text-gray-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            <p><span className="text-white">WASD</span> Move</p>
            <p><span className="text-white">J</span> Light Attack</p>
            <p><span className="text-white">K</span> Heavy/Skill</p>
            <p><span className="text-white">L</span> Block</p>
            <p><span className="text-white">2x A/D</span> Dash</p>
          </div>
        </div>

        <div
          className="border-2 border-[#3399ff]/40 bg-[#0d0d1a]/80 p-4"
          style={{ minWidth: 200 }}
        >
          <h3 className="text-[#3399ff] text-xs mb-3 text-center" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            PLAYER 2
          </h3>
          <div className="space-y-1.5 text-[10px] text-gray-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            <p><span className="text-white">Arrows</span> Move</p>
            <p><span className="text-white">Num1</span> Light Attack</p>
            <p><span className="text-white">Num2</span> Heavy/Skill</p>
            <p><span className="text-white">Num3</span> Block</p>
            <p><span className="text-white">2x &larr;&rarr;</span> Dash</p>
          </div>
        </div>
      </div>

      {/* 开始按钮 */}
      <button
        onClick={handleStart}
        className="relative z-10 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        <span
          className="block px-8 py-3 text-sm text-[#ffcc33] border-2 border-[#ffcc33] bg-[#1a1a2e]"
          style={{
            boxShadow: '0 0 15px rgba(255, 204, 51, 0.3), inset 0 0 15px rgba(255, 204, 51, 0.1)',
          }}
        >
          PRESS START
        </span>
      </button>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-20px); opacity: 1; }
        }
        @keyframes titleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @font-face {
          font-family: 'Press Start 2P';
          src: url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        }
      `}</style>
    </div>
  );
}