'use client';

import { useEffect, useState } from 'react';

// Midnight Editorial Design System Components

// Hook to detect desktop breakpoint
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return isDesktop;
}

// Hook for large desktop
export function useIsLargeDesktop() {
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const check = () => setIsLarge(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isLarge;
}

// The Hub Mark - circle with glass stem
export function D1Mark({ size = 28, color = 'var(--cream)' }: { size?: number; color?: string }) {
  const isDesktop = useIsDesktop();
  const actualSize = isDesktop ? size * 1.2 : size;

  return (
    <svg width={actualSize} height={actualSize} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke={color} strokeWidth="1"/>
      <path d="M9 11c0 5 2.5 8 5 8s5-3 5-8" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <line x1="14" y1="6" x2="14" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

// Hairline rule divider
export function D1Rule({ vertical, className }: { vertical?: boolean; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--rule)',
        width: vertical ? 1 : '100%',
        height: vertical ? '100%' : 1,
      }}
    />
  );
}

// Mono kicker text
export function Kicker({ children, color = 'var(--muted)', className, style }: {
  children: React.ReactNode;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isDesktop = useIsDesktop();
  const isLarge = useIsLargeDesktop();

  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: isLarge ? 12 : isDesktop ? 11 : 10,
        color,
        letterSpacing: isLarge ? 3 : isDesktop ? 2.5 : 2,
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Editorial headline with optional italic accent word
export function Headline({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--font-serif)',
        lineHeight: 0.95,
        letterSpacing: -1,
      }}
    >
      {children}
    </div>
  );
}

// Italic accent span for emphasis
export function ItalicAccent({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontStyle: 'italic', color: 'var(--copper)' }}>
      {children}
    </span>
  );
}

// Game accent colors
export const GAME_ACCENTS = {
  'beer-pressure': 'var(--game-beer-pressure)',
  'truth-or-drink': 'var(--game-truth-or-drink)',
  'id-game': 'var(--game-id-game)',
  'kings-cup': 'var(--game-kings-cup)',
  'most-likely-to': 'var(--game-most-likely)',
  'never-have-i-ever': 'var(--game-never)',
  'categories': 'var(--game-categories)',
} as const;

// Game number badges
export const GAME_NUMBERS = {
  'beer-pressure': '01',
  'truth-or-drink': '02',
  'id-game': '03',
  'kings-cup': '04',
  'most-likely-to': '05',
  'never-have-i-ever': '06',
  'categories': '07',
} as const;

// Player avatar circle
export function PlayerAvatar({
  name,
  active = false,
  size = 36,
}: {
  name: string;
  active?: boolean;
  size?: number;
}) {
  const isDesktop = useIsDesktop();
  const actualSize = isDesktop ? size * 1.15 : size;

  return (
    <div
      style={{
        width: actualSize,
        height: actualSize,
        borderRadius: 'var(--radius-circle)',
        background: active ? 'var(--copper)' : 'transparent',
        border: active ? 'none' : '1px solid var(--rule)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? 'var(--ink)' : 'var(--cream-2)',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: actualSize * 0.4,
      }}
    >
      {name[0]}
    </div>
  );
}

// Primary CTA button
export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const isDesktop = useIsDesktop();
  const isLarge = useIsLargeDesktop();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        background: disabled ? 'var(--muted)' : 'var(--cream)',
        color: 'var(--ink)',
        border: 'none',
        padding: isLarge ? '18px 36px' : isDesktop ? '16px 32px' : '14px 28px',
        fontFamily: 'var(--font-sans)',
        fontSize: isLarge ? 15 : isDesktop ? 14 : 13,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: '100%',
        textAlign: 'center',
      }}
    >
      {children}
    </button>
  );
}

// Secondary outline button
export function SecondaryButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const isDesktop = useIsDesktop();
  const isLarge = useIsLargeDesktop();

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        background: 'transparent',
        color: 'var(--cream)',
        border: '1px solid var(--rule)',
        padding: isLarge ? '18px 30px' : isDesktop ? '16px 26px' : '14px 22px',
        fontFamily: 'var(--font-sans)',
        fontSize: isLarge ? 15 : isDesktop ? 14 : 13,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'center',
      }}
    >
      {children}
    </button>
  );
}

// Copper accent button
export function CopperButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const isDesktop = useIsDesktop();
  const isLarge = useIsLargeDesktop();

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        background: 'transparent',
        color: 'var(--copper)',
        border: '1px solid var(--copper)',
        padding: isLarge ? '18px 30px' : isDesktop ? '16px 26px' : '14px 22px',
        fontFamily: 'var(--font-mono)',
        fontSize: isLarge ? 13 : isDesktop ? 12 : 11,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'center',
      }}
    >
      {children}
    </button>
  );
}

// Player chip for lobby
export function PlayerChip({
  name,
  onRemove,
}: {
  name: string;
  onRemove?: () => void;
}) {
  const isDesktop = useIsDesktop();

  return (
    <div
      style={{
        padding: isDesktop ? '10px 18px' : '8px 14px',
        border: '1px solid var(--rule)',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: isDesktop ? 16 : 14,
        display: 'inline-flex',
        alignItems: 'center',
        gap: isDesktop ? 10 : 8,
        color: 'var(--cream)',
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            color: 'var(--cream-2)',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: isDesktop ? 18 : 14,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// Inline player input with editorial styling
export function PlayerInput({ onAdd }: { onAdd: (name: string) => void }) {
  const isDesktop = useIsDesktop();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          border: '1px solid var(--copper)',
          padding: isDesktop ? '6px 12px' : '4px 10px',
          background: 'var(--ink-2)',
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="Name"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--cream)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: isDesktop ? 16 : 14,
            width: isDesktop ? 120 : 100,
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            background: name.trim() ? 'var(--copper)' : 'transparent',
            border: name.trim() ? 'none' : '1px solid var(--rule)',
            color: name.trim() ? 'var(--ink)' : 'var(--muted)',
            cursor: name.trim() ? 'pointer' : 'default',
            padding: '4px 10px',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: 1,
          }}
        >
          ADD
        </button>
        <button
          onClick={handleCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
            padding: 0,
            fontSize: isDesktop ? 18 : 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      style={{
        padding: isDesktop ? '10px 18px' : '8px 14px',
        border: '1px dashed var(--copper)',
        color: 'var(--copper)',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: isDesktop ? 16 : 14,
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      + add
    </button>
  );
}

// Legacy add player chip (for backward compatibility)
export function AddPlayerChip({ onClick }: { onClick: () => void }) {
  const isDesktop = useIsDesktop();

  return (
    <button
      onClick={onClick}
      style={{
        padding: isDesktop ? '10px 18px' : '8px 14px',
        border: '1px dashed var(--copper)',
        color: 'var(--copper)',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: isDesktop ? 16 : 14,
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      + add
    </button>
  );
}

// Responsive font size helper
export function useResponsiveFontSize(mobile: number, tablet?: number, desktop?: number) {
  const isDesktop = useIsDesktop();
  const isLarge = useIsLargeDesktop();

  if (isLarge && desktop) return desktop;
  if (isDesktop && tablet) return tablet;
  return mobile;
}
