'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'GAMES' },
  { href: '/decks', label: 'DECKS' },
  { href: '/settings', label: 'SETTINGS' },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on game play screens
  if (pathname.startsWith('/play/')) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-[30px] left-4 right-4"
      style={{
        background: 'var(--ink-2)',
        border: '1px solid var(--rule)',
        padding: '14px 18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {navItems.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: 1.5,
                color: isActive ? 'var(--copper)' : 'var(--muted)',
                textDecoration: 'none',
                transition: 'color 0.12s ease',
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
