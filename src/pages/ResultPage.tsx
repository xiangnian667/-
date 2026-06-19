/* ===== 结算页面 ===== */

import { useAppStore } from '../stores/gameStore';
import { COLORS } from '../game/constants';

export default function ResultPage() {
  const gameWinner = useAppStore((s) => s.gameWinner);
  const reset = useAppStore((s) => s.reset);
  const setPhase = useAppStore((s) => s.setPhase);

  const isP1Win = gameWinner === 'p1';
  const winnerName = isP1Win ? '玩家1' : '玩家2';
  const winnerColor = isP1Win ? COLORS.p1Main : COLORS.p2Main;
  const mechaColor = isP1Win ? '#cc2222' : '#2255cc';
  const mechaAccent = isP1Win ? '#ff9933' : '#33ccff';

  const handleRestart = () => {
    setPhase('battle');
  };

  const handleMenu = () => {
    reset();
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

      {/* 庆祝粒子 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? winnerColor : '#ffcc33',
              animation: `celebrate ${1 + Math.random() * 2}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 胜利机甲展示 */}
      <div className="relative z-10 mb-6">
        <div className="w-24 h-32 relative mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-28 relative" style={{ backgroundColor: mechaColor }}>
              {/* 天线 */}
              <div className="absolute top-0 left-3 w-2 h-1" style={{ backgroundColor: mechaAccent }} />
              <div className="absolute top-0 right-3 w-2 h-1" style={{ backgroundColor: mechaAccent }} />
              <div className="absolute top-1 left-5 w-10 h-1" style={{ backgroundColor: mechaAccent }} />
              {/* 面罩 */}
              <div className="absolute top-3 left-3 w-14 h-2" style={{ backgroundColor: '#ffdd00' }} />
              {/* 躯干 */}
              <div className="absolute top-8 left-3 w-14 h-10" style={{ backgroundColor: mechaColor, filter: 'brightness(0.7)' }} />
              {/* 腿 */}
              <div className="absolute bottom-0 left-4 w-4 h-8" style={{ backgroundColor: mechaColor, filter: 'brightness(0.6)' }} />
              <div className="absolute bottom-0 right-4 w-4 h-8" style={{ backgroundColor: mechaColor, filter: 'brightness(0.6)' }} />
            </div>
          </div>
        </div>
        {/* 光晕 */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-xl"
          style={{ backgroundColor: winnerColor, opacity: 0.2 }}
        />
      </div>

      {/* 胜利文字 */}
      <h1
        className="relative z-10 text-3xl font-bold text-center mb-2 tracking-wider"
        style={{
          color: winnerColor,
          textShadow: `0 0 20px ${winnerColor}, 0 0 40px ${winnerColor}`,
          animation: 'titleFloat 2s ease-in-out infinite',
        }}
      >
        {winnerName}
      </h1>
      <h2
        className="relative z-10 text-xl font-bold text-center mb-10 tracking-widest"
        style={{
          color: '#ffcc33',
          textShadow: '0 0 10px #ffcc33, 0 0 20px #ffcc33',
        }}
      >
        获胜！
      </h2>

      {/* 按钮 */}
      <div className="relative z-10 flex gap-6">
        <button
          onClick={handleRestart}
          className="cursor-pointer"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <span
            className="block px-6 py-3 text-xs text-[#ffcc33] border-2 border-[#ffcc33] bg-[#1a1a2e] hover:bg-[#2a2a4e] transition-all duration-200"
            style={{
              boxShadow: '0 0 10px rgba(255, 204, 51, 0.3)',
            }}
          >
            再来一局
          </span>
        </button>
        <button
          onClick={handleMenu}
          className="cursor-pointer"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <span
            className="block px-6 py-3 text-xs text-gray-400 border-2 border-gray-600 bg-[#1a1a2e] hover:bg-[#2a2a4e] transition-all duration-200"
          >
            返回菜单
          </span>
        </button>
      </div>

      <style>{`
        @keyframes celebrate {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
        }
        @keyframes titleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}