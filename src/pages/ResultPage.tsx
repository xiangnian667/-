/* ===== 结算页面 ===== */

import { useAppStore } from '../stores/gameStore';
import { COLORS } from '../game/constants';

export default function ResultPage() {
  const gameWinner = useAppStore((s) => s.gameWinner);
  const gameMode = useAppStore((s) => s.gameMode);
  const reset = useAppStore((s) => s.reset);
  const setPhase = useAppStore((s) => s.setPhase);

  const isP1Win = gameWinner === 'p1';
  const winnerName = isP1Win ? '玩家1' : gameMode === 'pve' ? '电脑' : '玩家2';
  const winnerColor = isP1Win ? COLORS.p1Main : COLORS.p2Main;
  const mechaColor = isP1Win ? '#cc2222' : '#2255cc';
  const mechaAccent = isP1Win ? '#ff9933' : '#33ccff';

  const btnStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 11,
    padding: '12px 28px',
    border: `2px solid ${active ? '#ffcc33' : '#555577'}`,
    background: active ? '#1a1a00' : '#0d0d1a',
    color: active ? '#ffcc33' : '#777799',
    cursor: 'pointer',
    boxShadow: active ? '0 0 12px rgba(255,204,51,0.3)' : 'none',
    textShadow: active ? '0 0 8px rgba(255,204,51,0.4)' : 'none',
    letterSpacing: 2,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 select-none"
      style={{ background: 'linear-gradient(180deg, #0a0a18 0%, #0d0d1a 50%, #0f0f20 100%)' }}
    >
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${winnerColor}, ${winnerColor}00 50%, ${winnerColor}00 50%, ${winnerColor})` }} />

      {/* 背景网格 */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#334466 1px, transparent 1px), linear-gradient(90deg, #334466 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 庆祝粒子 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              width: 3 + Math.random() * 3,
              height: 3 + Math.random() * 3,
              backgroundColor: [winnerColor, '#ffcc33', '#ffffff'][i % 3],
              animation: `rise ${1.5 + Math.random() * 2}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 像素装饰 */}
      <div className="relative z-10 flex justify-center gap-1 mb-2">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2"
            style={{ background: i < 3 ? winnerColor : i > 3 ? '#ffcc33' : '#ffffff', opacity: 0.5 + Math.sin(i) * 0.3 }}
          />
        ))}
      </div>

      {/* 胜利机甲 */}
      <div className="relative z-10">
        <div className="w-24 h-32 relative mx-auto">
          <div className="w-20 h-28 relative mx-auto" style={{ backgroundColor: mechaColor }}>
            <div className="absolute top-0 left-3 w-2 h-1" style={{ backgroundColor: mechaAccent }} />
            <div className="absolute top-0 right-3 w-2 h-1" style={{ backgroundColor: mechaAccent }} />
            <div className="absolute top-1 left-5 w-10 h-1" style={{ backgroundColor: mechaAccent }} />
            <div className="absolute top-3 left-3 w-14 h-2" style={{ backgroundColor: '#ffdd00' }} />
            <div className="absolute top-8 left-3 w-14 h-10" style={{ backgroundColor: mechaColor, filter: 'brightness(0.7)' }} />
            <div className="absolute bottom-0 left-4 w-4 h-8" style={{ backgroundColor: mechaColor, filter: 'brightness(0.6)' }} />
            <div className="absolute bottom-0 right-4 w-4 h-8" style={{ backgroundColor: mechaColor, filter: 'brightness(0.6)' }} />
          </div>
        </div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-xl"
          style={{ backgroundColor: winnerColor, opacity: 0.15 }}
        />
      </div>

      {/* 胜利文字 */}
      <h1
        className="relative z-10 text-2xl font-bold text-center tracking-widest"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          color: winnerColor,
          textShadow: `0 0 20px ${winnerColor}, 0 0 40px ${winnerColor}`,
          animation: 'titleFloat 2s ease-in-out infinite',
        }}
      >
        {winnerName}
      </h1>
      <h2
        className="relative z-10 text-xl font-bold text-center tracking-widest"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          color: '#ffcc33',
          textShadow: '0 0 10px #ffcc33',
        }}
      >
        获胜！
      </h2>

      {/* 按钮 */}
      <div className="relative z-10 flex gap-5">
        <button onClick={() => setPhase('battle')} style={btnStyle(true)}>
          再来一局
        </button>
        <button onClick={reset} style={btnStyle(false)}>
          返回菜单
        </button>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${winnerColor}00, ${winnerColor}44, ${winnerColor}00)` }} />

      <style>{`
        @keyframes rise {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-120px) scale(0); opacity: 0; }
        }
        @keyframes titleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}