/* ===== 触屏虚拟按键组件 ===== */

import { useRef, useCallback, useEffect, useState } from 'react';
import { touchPress, touchDirection, setExternalInput } from '../game/input';

const BTN_SIZE = 54;
const JOYSTICK_SIZE = 110;
const JOYSTICK_THUMB = 42;

interface BtnConfig {
  label: string;
  action: 'lightAttack' | 'heavyAttack' | 'block' | 'dash' | 'jump';
  color: string;
  glow: string;
  bg: string;
  icon: React.ReactNode;
  shape: 'circle' | 'diamond' | 'hex' | 'square';
}

const BTN_CONFIGS: BtnConfig[] = [
  {
    label: '普攻',
    action: 'lightAttack',
    color: '#ffc850',
    glow: 'rgba(255,200,80,0.4)',
    bg: 'rgba(255,180,40,0.10)',
    shape: 'diamond',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L15 8L8 15L1 8Z" stroke="#ffc850" strokeWidth="1.5" fill="none" />
        <line x1="8" y1="4" x2="8" y2="12" stroke="#ffc850" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: '跳跃',
    action: 'jump',
    color: '#cc88ff',
    glow: 'rgba(204,136,255,0.4)',
    bg: 'rgba(180,100,255,0.10)',
    shape: 'circle',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 14V5M8 5L4 9M8 5L12 9" stroke="#cc88ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 2V3" stroke="#cc88ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: '重攻',
    action: 'heavyAttack',
    color: '#ff5032',
    glow: 'rgba(255,80,50,0.4)',
    bg: 'rgba(255,60,30,0.10)',
    shape: 'diamond',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1L17 9L9 17L1 9Z" stroke="#ff5032" strokeWidth="1.5" fill="none" />
        <line x1="9" y1="4" x2="9" y2="14" stroke="#ff5032" strokeWidth="1.5" />
        <line x1="4" y1="9" x2="14" y2="9" stroke="#ff5032" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: '防御',
    action: 'block',
    color: '#32b4ff',
    glow: 'rgba(50,180,255,0.4)',
    bg: 'rgba(30,150,255,0.10)',
    shape: 'hex',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L15 5V11L8 15L1 11V5Z" stroke="#32b4ff" strokeWidth="1.5" fill="none" />
        <line x1="8" y1="5" x2="8" y2="11" stroke="#32b4ff" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: '冲刺',
    action: 'dash',
    color: '#32ff78',
    glow: 'rgba(50,255,120,0.4)',
    bg: 'rgba(30,255,100,0.10)',
    shape: 'square',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8H13M13 8L10 5M13 8L10 11" stroke="#32ff78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="2" y1="3" x2="2" y2="13" stroke="#32ff78" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="2" y1="3" x2="4" y2="3" stroke="#32ff78" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="2" y1="13" x2="4" y2="13" stroke="#32ff78" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
];

function getShapeStyle(config: BtnConfig, size: number): React.CSSProperties {
  switch (config.shape) {
    case 'diamond':
      return {
        width: size,
        height: size,
        transform: 'rotate(45deg)',
        borderRadius: 6,
      };
    case 'hex':
      return {
        width: size,
        height: size,
        borderRadius: '30%',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      };
    case 'square':
      return {
        width: size,
        height: size,
        borderRadius: 8,
      };
    default:
      return {
        width: size,
        height: size,
        borderRadius: '50%',
      };
  }
}

export default function TouchControls({ playerId }: { playerId: 'p1' | 'p2' }) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeBtn, setActiveBtn] = useState<string | null>(null);
  const joystickRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const joystickId = useRef<number | null>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleJoystickStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      joystickId.current = touch.identifier;
      updateJoystick(touch);
    },
    [playerId]
  );

  const handleJoystickMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickId.current) {
          updateJoystick(e.changedTouches[i]);
        }
      }
    },
    [playerId]
  );

  const handleJoystickEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickId.current) {
          joystickId.current = null;
          resetJoystick();
        }
      }
    },
    [playerId]
  );

  const updateJoystick = (touch: React.Touch) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxDist = rect.width / 2 - JOYSTICK_THUMB / 2;
    let dx = touch.clientX - cx;
    let dy = touch.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    const ndx = maxDist > 0 ? dx / maxDist : 0;
    const ndy = maxDist > 0 ? dy / maxDist : 0;

    if (thumbRef.current) {
      thumbRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    touchDirection(playerId, ndx, ndy);
  };

  const resetJoystick = () => {
    if (thumbRef.current) {
      thumbRef.current.style.transform = 'translate(0, 0)';
    }
    setExternalInput(playerId, { left: false, right: false, up: false, down: false });
  };

  const handleBtnDown = useCallback(
    (action: string) =>
      (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveBtn(action);
        touchPress(playerId, action as 'lightAttack' | 'heavyAttack' | 'block' | 'dash' | 'jump');
      },
    [playerId]
  );

  const handleBtnUp = useCallback(
    (action: string) =>
      (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveBtn(null);
      },
    []
  );

  if (!isTouchDevice) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50"
      style={{ touchAction: 'none' }}
    >
      {/* 左侧：摇杆 */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <div
          ref={joystickRef}
          style={{
            width: JOYSTICK_SIZE,
            height: JOYSTICK_SIZE,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.15)',
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          }}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
        >
          {/* 十字参考线 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="absolute w-px h-3/4 bg-white" />
            <div className="absolute h-px w-3/4 bg-white" />
          </div>
          <div
            ref={thumbRef}
            style={{
              width: JOYSTICK_THUMB,
              height: JOYSTICK_THUMB,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.25), rgba(255,255,255,0.08))',
              border: '2px solid rgba(255,255,255,0.25)',
              transition: 'none',
              position: 'relative',
              zIndex: 1,
              boxShadow: '0 0 10px rgba(255,255,255,0.1)',
            }}
          />
        </div>
      </div>

      {/* 右侧：按钮阵 */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="grid grid-cols-3 gap-3">
          {BTN_CONFIGS.map((cfg) => {
            const isActive = activeBtn === cfg.action;
            const shapeStyle = getShapeStyle(cfg, BTN_SIZE);

            return (
              <button
                key={cfg.action}
                className="touch-btn relative flex items-center justify-center select-none"
                style={{
                  width: BTN_SIZE,
                  height: BTN_SIZE,
                  border: `2px solid ${isActive ? cfg.color : `${cfg.color}66`}`,
                  background: isActive ? cfg.glow : cfg.bg,
                  borderRadius: 8,
                  color: cfg.color,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  touchAction: 'none',
                  transition: 'all 0.08s ease-out',
                  transform: isActive ? 'scale(0.9)' : 'scale(1)',
                  boxShadow: isActive
                    ? `0 0 16px ${cfg.glow}, inset 0 0 8px ${cfg.glow}`
                    : `0 0 6px ${cfg.glow}`,
                  WebkitTapHighlightColor: 'transparent',
                  outline: 'none',
                }}
                onTouchStart={handleBtnDown(cfg.action)}
                onTouchEnd={handleBtnUp(cfg.action)}
                onTouchCancel={handleBtnUp(cfg.action)}
              >
                {/* 形状背景 */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-20"
                  style={shapeStyle}
                >
                  <div style={{
                    ...shapeStyle,
                    width: BTN_SIZE - 6,
                    height: BTN_SIZE - 6,
                    border: `1px solid ${cfg.color}66`,
                    background: 'transparent',
                    position: 'absolute',
                  }} />
                </div>

                {/* 内容 */}
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  {cfg.icon}
                  <span
                    className="leading-none"
                    style={{
                      fontSize: 9,
                      textShadow: isActive ? `0 0 6px ${cfg.color}` : 'none',
                      letterSpacing: 1,
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}