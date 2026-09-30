export type Lang = 'ja' | 'en';

const ja = {
  app: 'いろあわせ',
  hue: '基準の色相',
  generate: 'つくる',
  save: 'この配色を保存',
  saved: '保存した配色',
  empty: 'まだ保存していません',
  nameTitle: '配色の名前',
  namePh: '例: 春の夜',
  ok: '保存',
  cancel: 'キャンセル',
  del: '削除',
  deleted: '配色を削除しました',
  undo: '元に戻す',
  copy: 'コピーしました',
  copyFail: 'コピーできませんでした',
  copyAll: '5色をコピー',
  lock: 'この色を固定',
  unlock: '固定を外す',
  approx: (name: string) => `${name}（目安）`,
  privacy: '配色はこの端末の中だけに保存されます。無料・広告なし・ログイン不要。色名は近い色の目安です。',
  randomHint: 'ランダムは「つくる」で混ぜます。色相バーは、ほかの配色の基準です。',
  load: 'この配色を開く',
};
export type Dict = typeof ja;

const en: Dict = {
  app: 'Iroawase',
  hue: 'Base hue',
  generate: 'Generate',
  save: 'Save this palette',
  saved: 'Saved palettes',
  empty: 'Nothing saved yet',
  nameTitle: 'Palette name',
  namePh: 'e.g. Spring night',
  ok: 'Save',
  cancel: 'Cancel',
  del: 'Delete',
  deleted: 'Palette deleted',
  undo: 'Undo',
  copy: 'Copied',
  copyFail: 'Could not copy',
  copyAll: 'Copy all 5',
  lock: 'Lock this color',
  unlock: 'Unlock',
  approx: (name: string) => `approx. ${name}`,
  privacy: 'Palettes stay on this device. Free, no ads, no login. Color names are approximate.',
  randomHint: 'Random mixes when you tap Generate. The hue bar is the base for the other harmonies.',
  load: 'Open this palette',
};

export const dicts: Record<Lang, Dict> = { ja, en };

export const HARMONY_LABEL: Record<Lang, { id: string; label: string }[]> = {
  ja: [
    { id: 'random', label: 'ランダム' },
    { id: 'analogous', label: '類似' },
    { id: 'complement', label: '補色' },
    { id: 'triadic', label: '三色' },
    { id: 'split', label: '分裂補色' },
    { id: 'mono', label: '単色' },
  ],
  en: [
    { id: 'random', label: 'Random' },
    { id: 'analogous', label: 'Analogous' },
    { id: 'complement', label: 'Complement' },
    { id: 'triadic', label: 'Triadic' },
    { id: 'split', label: 'Split' },
    { id: 'mono', label: 'Mono' },
  ],
};
