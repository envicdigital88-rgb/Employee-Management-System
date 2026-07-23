import { useState } from 'react';
import { CheckIcon, ImageIcon, LinkIcon, RefreshCwIcon, UserCircleIcon } from 'lucide-react';
import { Button } from './Button';

// ── Constants ────────────────────────────────────────────────────────────────
const FEMALE_SEEDS = [
  'Luna', 'Aria', 'Nora', 'Zara', 'Maya', 'Jade',
  'Sofia', 'Chloe', 'Emma', 'Isla', 'Layla', 'Mia',
  'Amara', 'Elena', 'Priya', 'Aisha', 'Fatima', 'Grace',
];

const MALE_SEEDS = [
  'Felix', 'Kai', 'Eli', 'Leo', 'Sam', 'River',
  'Ethan', 'Liam', 'Noah', 'Omar', 'Marcus', 'Ravi',
];

const NEUTRAL_SEEDS = [
  'Sage', 'Avery', 'Quinn', 'Rowan', 'Skyler', 'Drew',
];

export function dicebearUrl(seed: string) {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=14171c,1a1d23,262a31&radius=50`;
}

const fieldClass =
  'h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';

// ── AvatarPicker ─────────────────────────────────────────────────────────────
interface AvatarPickerProps {
  /** Full name used to auto-generate a name-based avatar */
  fullName?: string;
  /** Currently selected avatar URL */
  value: string;
  /** Called when the user selects a different avatar */
  onChange: (url: string) => void;
  /** Compact mode — used inside edit modals */
  compact?: boolean;
}

export function AvatarPicker({ fullName: name, value, onChange, compact = false }: AvatarPickerProps) {
  const [tab, setTab] = useState<'presets' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState('');
  const [customError, setCustomError] = useState('');

  const autoSeed = name?.trim() || null;
  const autoUrl  = autoSeed ? dicebearUrl(autoSeed) : null;

  const handleCustomApply = () => {
    if (!customUrl.trim()) { setCustomError('Please enter a URL.'); return; }
    try { new URL(customUrl.trim()); } catch {
      setCustomError('Please enter a valid URL (https://...)');
      return;
    }
    setCustomError('');
    onChange(customUrl.trim());
  };

  return (
    <div className={`rounded-2xl border border-line bg-surface-raised/60 p-4 space-y-3 ${compact ? 'text-xs' : ''}`}>
      {/* Header: preview + label */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {value ? (
            <img
              src={value}
              alt="Avatar"
              className={`${compact ? 'h-12 w-12' : 'h-14 w-14'} rounded-full border-2 border-accent/60 object-cover bg-surface`}
              onError={(e) => { (e.target as HTMLImageElement).src = dicebearUrl('fallback'); }}
            />
          ) : (
            <div className={`${compact ? 'h-12 w-12' : 'h-14 w-14'} rounded-full border-2 border-dashed border-line bg-surface flex items-center justify-center`}>
              <UserCircleIcon className="h-6 w-6 text-content-faint" />
            </div>
          )}
          {value && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
              <CheckIcon className="h-3 w-3 text-white" />
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-content">Profile Picture</p>
          <p className="text-xs text-content-faint mt-0.5">
            {value ? 'Avatar selected — change anytime' : 'Choose an avatar below'}
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-line bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab('presets')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
            tab === 'presets' ? 'bg-accent/15 text-accent' : 'text-content-muted hover:text-content'
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Preset Icons
        </button>
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
            tab === 'url' ? 'bg-accent/15 text-accent' : 'text-content-muted hover:text-content'
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          Custom URL
        </button>
      </div>

      {/* Presets */}
      {tab === 'presets' && (
        <div className="space-y-2">
          {/* Auto-generated from name */}
          {autoUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-line/60 bg-surface px-3 py-2">
              <img
                src={autoUrl}
                alt="Auto avatar"
                className={`${
                  value === autoUrl ? 'ring-2 ring-accent scale-105' : ''
                } h-9 w-9 rounded-full cursor-pointer border-2 border-transparent transition-all object-cover bg-surface hover:scale-105`}
                onClick={() => onChange(autoUrl)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-content truncate">Auto — {name}</p>
                <p className="text-[10px] text-content-faint">Generated from name</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(autoUrl)}
                className="flex items-center gap-1 text-[10px] text-accent hover:underline shrink-0"
              >
                <RefreshCwIcon className="h-3 w-3" /> Use
              </button>
            </div>
          )}

          {/* Grouped preset sections */}
          {([
            { label: '♀ Female', seeds: FEMALE_SEEDS, cols: 'grid-cols-6' },
            { label: '♂ Male',   seeds: MALE_SEEDS,   cols: 'grid-cols-6' },
            { label: '⚥ Neutral', seeds: NEUTRAL_SEEDS, cols: 'grid-cols-6' },
          ] as const).map(({ label, seeds, cols }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold text-content-faint mb-1.5 uppercase tracking-wider">{label}</p>
              <div className={`grid ${cols} gap-2`}>
                {seeds.map((seed) => {
                  const url = dicebearUrl(seed);
                  const selected = value === url;
                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => onChange(url)}
                      title={seed}
                      className={`group relative rounded-full p-0.5 transition-all hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        selected ? 'ring-2 ring-accent scale-110' : ''
                      }`}
                    >
                      <img src={url} alt={seed} className="h-10 w-10 rounded-full object-cover bg-surface" />
                      {selected && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                          <CheckIcon className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom URL */}
      {tab === 'url' && (
        <div className="space-y-2">
          <p className="text-xs text-content-faint">Paste any image URL (https://...)</p>
          <div className="flex gap-2">
            <input
              type="url"
              className={`${fieldClass} flex-1`}
              placeholder="https://example.com/photo.jpg"
              value={customUrl}
              onChange={(e) => { setCustomUrl(e.target.value); setCustomError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomApply())}
            />
            <Button type="button" variant="primary" className="h-10 px-4 shrink-0" onClick={handleCustomApply}>
              Apply
            </Button>
          </div>
          {customError && <p className="text-xs text-rose-400">{customError}</p>}
          {value && value.startsWith('http') && ![...FEMALE_SEEDS, ...MALE_SEEDS, ...NEUTRAL_SEEDS].some(s => dicebearUrl(s) === value) && !autoUrl?.includes(value) && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
              <img src={value} alt="preview" className="h-6 w-6 rounded-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-xs text-emerald-400">Custom URL applied</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
