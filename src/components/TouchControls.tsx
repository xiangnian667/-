/* ===== 触屏虚拟按键组件 ===== */

import { useRef, useCallback, useEffect, useState } from 'react';
import { touchPress, touchDirection, setExternalInput } from '../game/input';

const BTN_SIZE = 56;
const JOYSTICK_SIZE = 120;
const JOYSTICK_THUMB = 48;

export default function TouchControls({ playerId }: { playerId: 'p1' | 'p2' }) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const joystickActive = useRef(false);
  const joystickId = useRef<number | null>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // 摇杆处理
  const handleJoystickStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      joystickActive.current = true;
      joystickId.current = touch.identifier;
      updateJoystick(touch);
    },
    [playerId]
  );

  const handleJoystickMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickId.current) {
          updateJoystick(touch);
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
          joystickActive.current = false;
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

    // 归一化方向
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

  // 按钮处理
  const handleBtnDown = useCallback(
    (action: 'lightAttack' | 'heavyAttack' | 'block' | 'dash') =>
      (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        touchPress(playerId, action);
      },
    [playerId]
  );

  if (!isTouchDevice) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50"
      style={{ touchAction: 'none' }}
    >
      {/* 左侧摇杆 */}
      <div
        ref={joystickRef}
        className="absolute bottom-8 left-6 pointer-events-auto"
        style={{
          width: JOYSTICK_SIZE,
          height: JOYSTICK_SIZE,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.25)',
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
      >
        <div
          ref={thumbRef}
          style={{
            width: JOYSTICK_THUMB,
            height: JOYSTICK_THUMB,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.20)',
            border: '2px solid rgba(255,255,255,0.35)',
            transition: joystickActive.current ? 'none' : 'transform 0.1s ease-out',
          }}
        />
      </div>

      {/* 右侧按钮 */}
      <div className="absolute bottom-8 right-4 pointer-events-auto flex gap-2">
        {/* 轻攻击 */}
        <button
          className="touch-btn"
          style={{
            width: BTN_SIZE,
            height: BTN_SIZE,
            borderRadius: '50%',
            border: '2px solid rgba(255,200,80,0.5)',
            background: 'rgba(255,200,80,0.15)',
            color: '#ffc850',
            fontSize: 11,
            fontFamily: "'Press Start 2P', monospace",
            touchAction: 'none',
          }}
          onTouchStart={handleBtnDown('lightAttack')}
        >
          轻
        </button>
        {/* 重攻击 */}
        <button
          className="touch-btn"
          style={{
            width: BTN_SIZE,
            height: BTN_SIZE,
            borderRadius: '50%',
            border: '2px solid rgba(255,80,50,0.5)',
            background: 'rgba(255,80,50,0.15)',
            color: '#ff5032',
            fontSize: 11,
            fontFamily: "'Press Start 2P', monospace",
            touchAction: 'none',
          }}
          onTouchStart={handleBtnDown('heavyAttack')}
        >
          重
        </button>
        {/* 防御 */}
        <button
          className="touch-btn"
          style={{
            width: BTN_SIZE,
            height: BTN_SIZE,
            borderRadius: '50%',
            border: '2px solid rgba(50,180,255,0.5)',
            background: 'rgba(50,180,255,0.15)',
            color: '#32b4ff',
            fontSize: 11,
            fontFamily: "'Press Start 2P', monospace",
            touchAction: 'none',
          }}
          onTouchStart={handleBtnDown('block')}
        >
          防
        </button>
        {/* 冲刺 */}
        <button
          className="touch-btn"
          style={{
            width: BTN_SIZE,
            height: BTN_SIZE,
            borderRadius: '50%',
            border: '2px solid rgba(50,255,120,0.5)',
            background: 'rgba(50,255,120,0.15)',
            color: '#32ff78',
            fontSize: 11,
            fontFamily: "'Press Start 2P', monospace",
            touchAction: 'none',
          }}
          onTouchStart={handleBtnDown('dash')}
        >
          冲
        </button>
      </div>
    </div>
  );
}