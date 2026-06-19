/* ===== 触屏虚拟按键组件 ===== */

import { useRef, useCallback, useEffect, useState } from 'react';
import { touchPress, touchDirection, setExternalInput } from '../game/input';

const BTN_SIZE = 50;
const JOYSTICK_SIZE = 110;
const JOYSTICK_THUMB = 42;

export default function TouchControls({ playerId }: { playerId: 'p1' | 'p2' }) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
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
    (action: 'lightAttack' | 'heavyAttack' | 'block' | 'dash' | 'jump' | 'slamAttack') =>
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
      {/* 左侧：摇杆 */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <div
          ref={joystickRef}
          style={{
            width: JOYSTICK_SIZE,
            height: JOYSTICK_SIZE,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.04)',
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
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              transition: 'none',
            }}
          />
        </div>
      </div>

      {/* 右侧：3x2 按钮阵 */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="grid grid-cols-3 gap-2">
          {/* 轻攻击 */}
          <button
            className="touch-btn"
            style={{
              width: BTN_SIZE,
              height: BTN_SIZE,
              borderRadius: '50%',
              border: '2px solid rgba(255,200,80,0.5)',
              background: 'rgba(255,200,80,0.12)',
              color: '#ffc850',
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              touchAction: 'none',
              lineHeight: 1,
            }}
            onTouchStart={handleBtnDown('lightAttack')}
          >
            轻攻
          </button>
          {/* 跳跃 */}
          <button
            className="touch-btn"
            style={{
              width: BTN_SIZE,
              height: BTN_SIZE,
              borderRadius: '50%',
              border: '2px solid rgba(204,136,255,0.5)',
              background: 'rgba(204,136,255,0.12)',
              color: '#cc88ff',
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              touchAction: 'none',
              lineHeight: 1,
            }}
            onTouchStart={handleBtnDown('jump')}
          >
            跳跃
          </button>
          {/* 重攻击 */}
          <button
            className="touch-btn"
            style={{
              width: BTN_SIZE,
              height: BTN_SIZE,
              borderRadius: '50%',
              border: '2px solid rgba(255,80,50,0.5)',
              background: 'rgba(255,80,50,0.12)',
              color: '#ff5032',
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              touchAction: 'none',
              lineHeight: 1,
            }}
            onTouchStart={handleBtnDown('heavyAttack')}
          >
            重攻
          </button>
          {/* 防御 */}
          <button
            className="touch-btn"
            style={{
              width: BTN_SIZE,
              height: BTN_SIZE,
              borderRadius: '50%',
              border: '2px solid rgba(50,180,255,0.5)',
              background: 'rgba(50,180,255,0.12)',
              color: '#32b4ff',
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              touchAction: 'none',
              lineHeight: 1,
            }}
            onTouchStart={handleBtnDown('block')}
          >
            防御
          </button>
          {/* 下落攻击 */}
          <button
            className="touch-btn"
            style={{
              width: BTN_SIZE,
              height: BTN_SIZE,
              borderRadius: '50%',
              border: '2px solid rgba(255,100,200,0.5)',
              background: 'rgba(255,100,200,0.12)',
              color: '#ff64c8',
              fontSize: 10,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              touchAction: 'none',
              lineHeight: 1,
            }}
            onTouchStart={handleBtnDown('slamAttack')}
          >
            下落
          </button>
          {/* 冲刺 */}
          <button
            className="touch-btn"
            style={{
              width: BTN_SIZE,
              height: BTN_SIZE,
              borderRadius: '50%',
              border: '2px solid rgba(50,255,120,0.5)',
              background: 'rgba(50,255,120,0.12)',
              color: '#32ff78',
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              touchAction: 'none',
              lineHeight: 1,
            }}
            onTouchStart={handleBtnDown('dash')}
          >
            冲刺
          </button>
        </div>
      </div>
    </div>
  );
}