# いろあわせ（Iroawase）

5色の配色をつくる、日本語優先の PWA。**無料・広告なし・ログイン不要・オフライン対応。**

## できること

- ランダム、または類似色・補色・三色・分裂補色・単色（基準の色相から）
- 気に入った色だけ固定して、残りを作り直す
- 色をタップすると HEX をコピー。近い一般的な色名（朱、紺、若紫など）を目安で表示
- 名前を付けてこの端末に保存、削除できる

色名は短い見本リストへの近似です。伝統色の厳密な名前ではありません。データは IndexedDB にだけ保存します。

## English

**Iroawase** builds 5-color palettes: random, analogous, complementary, triadic, split-complementary, or monochrome from a base hue. Lock swatches and regenerate the rest. Tap a color to copy its hex. A short list of common Japanese color names is shown only when a swatch is close (labeled approximate). Save and delete palettes on this device. Free, no ads, no login, no account, works offline.

## 開発 / Development

```bash
npm install
npm run dev
npm run build
```

Vite + vanilla TypeScript + vite-plugin-pwa（`registerType: 'autoUpdate'`, `base: './'`）。
