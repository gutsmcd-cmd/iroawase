export type Harmony = 'random' | 'analogous' | 'complement' | 'triadic' | 'split' | 'mono';

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const lig = l / 100;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const c = lig - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function makePalette(kind: Harmony, hue: number): string[] {
  const w = (d: number) => (hue + d + 360) % 360;
  switch (kind) {
    case 'random':
      return [0, 1, 2, 3, 4].map((i) =>
        hslToHex(i === 0 ? hue : rand(0, 360), rand(52, 82), rand(38, 68)),
      );
    case 'analogous':
      return [-32, -16, 0, 16, 32].map((d, i) => hslToHex(w(d), 70 - i, 40 + i * 8));
    case 'complement':
      return [
        hslToHex(hue, 72, 40),
        hslToHex(hue, 58, 56),
        hslToHex(hue, 42, 74),
        hslToHex(w(180), 68, 44),
        hslToHex(w(180), 52, 64),
      ];
    case 'triadic':
      return [
        hslToHex(hue, 68, 44),
        hslToHex(w(120), 68, 48),
        hslToHex(w(240), 68, 46),
        hslToHex(hue, 48, 70),
        hslToHex(w(120), 46, 72),
      ];
    case 'split':
      return [
        hslToHex(hue, 70, 44),
        hslToHex(hue, 48, 70),
        hslToHex(w(150), 66, 48),
        hslToHex(w(210), 66, 50),
        hslToHex(w(210), 44, 70),
      ];
    case 'mono':
      return [26, 40, 52, 66, 84].map((l, i) => hslToHex(hue, i === 4 ? 22 : 46, l));
  }
}

/** Common names only. Matching is approximate — never a precise traditional-color claim. */
export const NAMES: { ja: string; en: string; hex: string }[] = [
  { ja: '赤', en: 'red', hex: '#E60012' },
  { ja: '朱', en: 'vermilion', hex: '#EF454A' },
  { ja: '紅', en: 'crimson', hex: '#D7003A' },
  { ja: '茜', en: 'madder', hex: '#B7282E' },
  { ja: 'ピンク', en: 'pink', hex: '#F4A7B9' },
  { ja: '桜', en: 'cherry', hex: '#F4B3C2' },
  { ja: '橙', en: 'orange', hex: '#EE7800' },
  { ja: '黄', en: 'yellow', hex: '#FFD900' },
  { ja: '山吹', en: 'golden yellow', hex: '#F8B500' },
  { ja: '黄土', en: 'ochre', hex: '#C4A35A' },
  { ja: '金', en: 'gold', hex: '#E6B422' },
  { ja: '緑', en: 'green', hex: '#009944' },
  { ja: '若草', en: 'young green', hex: '#8FBC5A' },
  { ja: '萌黄', en: 'spring green', hex: '#A4C520' },
  { ja: '抹茶', en: 'matcha', hex: '#507D3A' },
  { ja: '青', en: 'blue', hex: '#0075C2' },
  { ja: '紺', en: 'navy', hex: '#223A70' },
  { ja: '藍', en: 'indigo', hex: '#165E83' },
  { ja: '群青', en: 'ultramarine', hex: '#465DAA' },
  { ja: '水色', en: 'light blue', hex: '#A0D8EF' },
  { ja: '空', en: 'sky', hex: '#89C3EB' },
  { ja: '紫', en: 'purple', hex: '#884898' },
  { ja: '若紫', en: 'light purple', hex: '#C4A4D6' },
  { ja: '藤', en: 'wisteria', hex: '#A59ACA' },
  { ja: '茶', en: 'brown', hex: '#8C5A3C' },
  { ja: '焦茶', en: 'dark brown', hex: '#6F4B3E' },
  { ja: 'ベージュ', en: 'beige', hex: '#F5F5DC' },
  { ja: '生成り', en: 'unbleached', hex: '#F4EBD0' },
  { ja: '白', en: 'white', hex: '#F4F4F4' },
  { ja: '銀', en: 'silver', hex: '#C0C0C0' },
  { ja: '灰', en: 'gray', hex: '#808080' },
  { ja: '黒', en: 'black', hex: '#222222' },
];

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function nearestName(hex: string): { ja: string; en: string } | null {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return null;
  const [r, g, b] = rgb(hex);
  let best = NAMES[0];
  let bestD = Infinity;
  for (const n of NAMES) {
    const [r2, g2, b2] = rgb(n.hex);
    const d = Math.hypot(r - r2, g - g2, b - b2);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  if (bestD > 72) return null;
  return { ja: best.ja, en: best.en };
}

export function inkFor(hex: string): string {
  const [r, g, b] = rgb(/^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#888888');
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y > 150 ? '#1A1A1A' : '#FFFFFF';
}
