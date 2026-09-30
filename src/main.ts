import './base.css';
import './style.css';
import { h, toast, copyText, uid, langToggle, icon, showSaveBanner, hideSaveBanner, promptDialog } from './ui';
import { initDb, loadState, saveState } from './db';
import { dicts, HARMONY_LABEL, type Lang, type Dict } from './i18n';
import { makePalette, nearestName, inkFor, type Harmony } from './color';

interface Saved { id: string; name: string; colors: string[]; created: number }
interface State {
  lang: Lang;
  hue: number;
  harmony: Harmony;
  colors: string[];
  locks: boolean[];
  saved: Saved[];
}

const HARMONIES: Harmony[] = ['random', 'analogous', 'complement', 'triadic', 'split', 'mono'];

function fresh(): State {
  return {
    lang: 'ja',
    hue: 262,
    harmony: 'analogous',
    colors: makePalette('analogous', 262),
    locks: [false, false, false, false, false],
    saved: [],
  };
}

function isHarmony(v: unknown): v is Harmony {
  return typeof v === 'string' && (HARMONIES as string[]).includes(v);
}

function sanitize(s: State): State {
  const base = fresh();
  const colors = Array.isArray(s.colors) && s.colors.length === 5 && s.colors.every((c) => typeof c === 'string')
    ? s.colors.map((c) => c.toUpperCase())
    : base.colors;
  const locks = Array.isArray(s.locks) && s.locks.length === 5 ? s.locks.map(Boolean) : base.locks;
  const saved = Array.isArray(s.saved)
    ? s.saved.filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.colors) && p.colors.length === 5)
    : [];
  return {
    lang: s.lang === 'en' ? 'en' : 'ja',
    hue: Number.isFinite(s.hue) ? ((s.hue % 360) + 360) % 360 : base.hue,
    harmony: isHarmony(s.harmony) ? s.harmony : 'analogous',
    colors,
    locks,
    saved,
  };
}

let state = fresh();
let t: Dict = dicts.ja;
const app = document.getElementById('app')!;
let saveTimer = 0;

async function persist(): Promise<void> {
  const ok = await saveState(state);
  if (ok) hideSaveBanner();
  else showSaveBanner();
}
function persistSoon() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => { void persist(); }, 250);
}

function applyGenerated(full = false) {
  const next = makePalette(state.harmony, state.hue);
  state.colors = state.colors.map((c, i) => (!full && state.locks[i] ? c : next[i]));
}

function setLang(l: Lang) {
  state.lang = l;
  t = dicts[l];
  document.documentElement.lang = l;
  document.title = t.app;
  void persist();
  render();
}

let swatchEls: HTMLElement[] = [];

function paintSwatches() {
  state.colors.forEach((hex, i) => {
    const el = swatchEls[i];
    if (!el) return;
    el.style.background = hex;
    el.style.color = inkFor(hex);
    const hexEl = el.querySelector('.hex');
    const nameEl = el.querySelector('.cname');
    if (hexEl) hexEl.textContent = hex;
    if (nameEl) {
      const n = nearestName(hex);
      nameEl.textContent = n ? t.approx(state.lang === 'ja' ? n.ja : n.en) : '';
    }
  });
}

function onHue(value: number) {
  state.hue = value;
  if (state.harmony !== 'random') {
    applyGenerated(false);
    paintSwatches();
  }
  persistSoon();
}

async function savePalette() {
  const name = await promptDialog(t.nameTitle, t.ok, t.cancel, '', t.namePh);
  if (name === null) return;
  const trimmed = name.trim() || (state.lang === 'ja' ? `パレット ${state.saved.length + 1}` : `Palette ${state.saved.length + 1}`);
  state.saved.unshift({ id: uid(), name: trimmed, colors: [...state.colors], created: Date.now() });
  render();
  void persist();
}

function deleteSaved(p: Saved) {
  const idx = state.saved.findIndex((x) => x.id === p.id);
  if (idx < 0) return;
  state.saved.splice(idx, 1);
  void persist();
  render();
  toast(t.deleted, {
    label: t.undo,
    run: () => {
      if (!state.saved.some((x) => x.id === p.id)) state.saved.splice(Math.min(idx, state.saved.length), 0, p);
      void persist();
      render();
    },
  });
}

function render() {
  t = dicts[state.lang];
  const hue = h('input', {
    class: 'hue',
    type: 'range',
    min: '0',
    max: '360',
    value: String(Math.round(state.hue)),
    'aria-label': t.hue,
  }) as HTMLInputElement;
  hue.addEventListener('input', () => onHue(Number(hue.value)));

  swatchEls = state.colors.map((hex, i) => {
    const hit = h('button', { class: 'swatch-hit', type: 'button' },
      h('span', { class: 'hex' }, hex),
      h('span', { class: 'cname' }, ''),
    );
    hit.addEventListener('click', async () => {
      toast((await copyText(state.colors[i])) ? t.copy : t.copyFail);
    });
    const lock = h('button', {
      class: 'lock',
      type: 'button',
      'aria-pressed': String(state.locks[i]),
      'aria-label': state.locks[i] ? t.unlock : t.lock,
    }, icon(state.locks[i] ? 'lock' : 'unlock'));
    lock.addEventListener('click', () => {
      state.locks[i] = !state.locks[i];
      void persist();
      render();
    });
    const box = h('div', { class: 'swatch' }, hit, lock);
    return box;
  });

  const chips = h('div', { class: 'chips', role: 'group' }, ...HARMONY_LABEL[state.lang].map((item) => {
    const b = h('button', {
      type: 'button',
      'aria-pressed': String(state.harmony === item.id),
    }, item.label);
    b.addEventListener('click', () => {
      if (!isHarmony(item.id)) return;
      state.harmony = item.id;
      if (item.id !== 'random') applyGenerated(false);
      void persist();
      render();
    });
    return b;
  }));

  const savedBox = h('div', { class: 'saved' });
  if (!state.saved.length) savedBox.append(h('p', { class: 'empty' }, t.empty));
  else {
    for (const p of state.saved) {
      const dots = h('div', { class: 'dots' }, ...p.colors.map((c) => h('i', { style: `background:${c}` })));
      const open = h('button', { class: 'saved-main', type: 'button', 'aria-label': t.load },
        h('div', { class: 'saved-name' }, p.name),
        dots,
      );
      open.addEventListener('click', () => {
        state.colors = [...p.colors];
        state.locks = [false, false, false, false, false];
        void persist();
        render();
      });
      const del = h('button', { class: 'icon-btn', type: 'button', 'aria-label': t.del }, icon('trash'));
      del.addEventListener('click', () => deleteSaved(p));
      savedBox.append(h('div', { class: 'saved-item' }, open, del));
    }
  }

  app.replaceChildren(
    h('header', { class: 'topbar' },
      h('h1', {}, t.app),
      langToggle(state.lang, setLang),
    ),
    h('main', {},
      chips,
      h('label', { class: 'field' }, t.hue, hue),
      state.harmony === 'random' ? h('p', { class: 'hint muted small' }, t.randomHint) : null,
      h('div', { class: 'swatches' }, ...swatchEls),
      h('div', { class: 'row' },
        h('button', {
          class: 'btn primary grow',
          type: 'button',
          onclick: () => { applyGenerated(false); void persist(); render(); },
        }, t.generate),
        h('button', {
          class: 'btn',
          type: 'button',
          onclick: async () => { toast((await copyText(state.colors.join(' '))) ? t.copy : t.copyFail); },
        }, t.copyAll),
      ),
      h('button', { class: 'btn block', type: 'button', onclick: () => { void savePalette(); } }, t.save),
      h('h2', { class: 'sec' }, t.saved),
      savedBox,
      h('p', { class: 'foot' }, t.privacy),
    ),
  );
  paintSwatches();
}

async function boot() {
  const ok = await initDb('iroawase');
  if (!ok) showSaveBanner();
  state = sanitize(await loadState(fresh()));
  t = dicts[state.lang];
  document.documentElement.lang = state.lang;
  document.title = t.app;
  render();
  window.addEventListener('pagehide', () => { void persist(); });
}
void boot();
