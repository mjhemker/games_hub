'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { D1Rule, Kicker, ItalicAccent } from '@/components/ui/design-system';
import { SpiceLevel } from '@/lib/types';

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const [apiKey, setApiKey] = useState(settings.geminiApiKeyOverride || '');

  const handleSaveApiKey = () => {
    updateSettings({ geminiApiKeyOverride: apiKey || undefined });
  };

  const rows = [
    {
      label: 'Spice level',
      value: settings.defaultSpice === 1 ? 'Tame · 🌱' : settings.defaultSpice === 2 ? 'Medium · 🔥' : 'Spicy · 🌶️',
      onClick: () => {
        const next = ((settings.defaultSpice % 3) + 1) as SpiceLevel;
        updateSettings({ defaultSpice: next });
      },
    },
    {
      label: 'Haptics',
      value: settings.hapticsEnabled ? 'On' : 'Off',
      onClick: () => updateSettings({ hapticsEnabled: !settings.hapticsEnabled }),
    },
    {
      label: 'Theme',
      value: 'Midnight',
      onClick: () => {},
    },
    {
      label: 'Gemini key',
      value: settings.geminiApiKeyOverride ? '••••••••' + settings.geminiApiKeyOverride.slice(-4) : 'Not set',
      onClick: () => {
        const key = prompt('Enter your Gemini API key:');
        if (key !== null) {
          updateSettings({ geminiApiKeyOverride: key || undefined });
        }
      },
    },
  ];

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '64px 22px 0' }}>
        <Kicker color="var(--muted)">SETTINGS</Kicker>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 44,
            lineHeight: 0.95,
            marginTop: 8,
            letterSpacing: -0.8,
            color: 'var(--cream)',
          }}
        >
          The house <ItalicAccent>rules</ItalicAccent>
        </div>
      </div>

      {/* Settings List */}
      <div style={{ marginTop: 26, borderTop: '1px solid var(--rule)' }}>
        {rows.map((row, i) => (
          <button
            key={i}
            onClick={row.onClick}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 22px',
              borderBottom: '1px solid var(--rule)',
              width: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 17,
                color: 'var(--cream)',
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--cream-2)',
                letterSpacing: 0.5,
              }}
            >
              {row.value}
            </span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '24px 22px',
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          fontStyle: 'italic',
          color: 'var(--muted)',
          lineHeight: 1.5,
        }}
      >
        Drink water between rounds. The night is long.
      </div>

      {/* About */}
      <div
        style={{
          padding: '24px 22px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            letterSpacing: 1.5,
          }}
        >
          DRINKING GAMES HUB · V1.0
        </div>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontStyle: 'italic',
            color: 'var(--muted)',
            marginTop: 8,
          }}
        >
          For adults 21+ only.
        </div>
      </div>

      {/* Bottom spacing for nav */}
      <div style={{ height: 120 }} />
    </div>
  );
}
