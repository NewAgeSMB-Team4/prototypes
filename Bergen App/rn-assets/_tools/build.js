/* Bergen Kids — React Native asset pack builder.
   Reads every piece of artwork out of the prototype (index.html) and writes a
   complete light/dark asset folder. Nothing here is redrawn: icons come from
   the sprite, illustrations from the JS constants, colours from the CSS. */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const sharp = require('sharp');

/* Run from anywhere: node build.js && node docs.js
   Paths assume this file lives in <prototype>/rn-assets/_tools/. */
const ROOT = path.resolve(__dirname, '..', '..');          // the "Bergen App" folder
const SRC = path.join(ROOT, 'index.html');
const OUT = path.join(ROOT, 'rn-assets');
const LOGO_PNG = path.join(__dirname, 'logo-remote.png');
const html = fs.readFileSync(SRC, 'utf8');

// the wordmark is a hosted PNG, not part of index.html — cache it next to this script
if (!fs.existsSync(LOGO_PNG)) {
  const url = html.match(/const LOGO = '([^']+)'/)[1];
  console.log('fetching wordmark:', url);
  const buf = require('child_process').execSync(
    `node -e "fetch('${url}').then(r=>r.arrayBuffer()).then(b=>process.stdout.write(Buffer.from(b)))"`,
    { maxBuffer: 64 << 20, encoding: 'buffer' });
  fs.writeFileSync(LOGO_PNG, buf);
}

const DENSITIES = [1, 2, 3];
const manifest = { generated: null, source: 'Bergen App/index.html', groups: {} };

/* ---------- palette, straight out of the stylesheet ---------- */
const C = {
  light: {
    ink: '#1a2e4a', ink2: '#33455e', muted: '#54637a', faint: '#78899c',
    grass: '#2d7a4f', teal: '#1e8c7a', cream: '#fdf8f0', card: '#ffffff',
    line: '#e7ecf1', sun: '#f5a623',
  },
  dark: {
    ink: '#e9f2ec', ink2: '#e9f2ec', muted: '#a0b4a8', faint: '#7f948a',
    grass: '#6cc490', teal: '#4fc3ae', cream: '#0f1915', card: '#17241e',
    line: 'rgba(255,255,255,0.11)', sun: '#f5a623',
  },
};
const SKY = {
  welcome: { light: [['#fffdf7', 0], ['#fdf9f0', .38], ['#f7faee', .66], ['#eff8ea', 1]] },
  signup: { light: [['#fffdf7', 0], ['#fdf9f0', .44], ['#f6faee', .76], ['#eff8ea', 1]] },
  dark: [['#101b17', 0], ['#0f1915', .46], ['#0e1a16', .78], ['#0d1b16', 1]],
};

/* ---------- small helpers ---------- */
const mk = d => fs.mkdirSync(d, { recursive: true });
const write = (p, s) => { mk(path.dirname(p)); fs.writeFileSync(p, s); };
function png(svg, outFile, wPt, density) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: Math.round(wPt * density) }, font: { loadSystemFonts: false } });
  mk(path.dirname(outFile));
  fs.writeFileSync(outFile, r.render().asPng());
}
const suffix = d => (d === 1 ? '' : `@${d}x`);
function emitPng(svg, dir, name, wPt) {
  DENSITIES.forEach(d => png(svg, path.join(dir, `${name}${suffix(d)}.png`), wPt, d));
}
const svgDoc = (w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"${extra}>\n${body}\n</svg>\n`;
const grad = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">` +
  stops.map(([c, o]) => `<stop offset="${(o * 100).toFixed(0)}%" stop-color="${c}"/>`).join('') +
  `</linearGradient>`;

/* ================= 1. ICONS — the sprite ================= */
const ICON_ATTRS = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
const icons = [];
for (const m of html.matchAll(/<symbol id="i-([a-z0-9-]+)" viewBox="([^"]+)">([\s\S]*?)<\/symbol>/g)) {
  icons.push({ name: m[1], viewBox: m[2], body: m[3].trim() });
}
if (icons.length !== 56) throw new Error('expected 56 sprite symbols, got ' + icons.length);

/* which icons the app code refers to at all. Icon names travel through data
   (categories, tab tuples), so the honest test is "quoted by name anywhere
   outside the sprite" rather than "seen in an ic() call". */
const outsideSprite = (() => {
  const a = html.indexOf('<!-- ICON SPRITE -->'), b = html.indexOf('<div id="stage">');
  return html.slice(0, a) + html.slice(b);
})();
const usedNames = new Set(icons.map(i => i.name).filter(n => outsideSprite.includes(`'${n}'`)));

manifest.groups.icons = { base: '24x24 pt', note: 'stroke-only, currentColor', items: [] };
for (const ic of icons) {
  const master = svgDoc(24, 24, '  ' + ic.body.replace(/\n\s+/g, '\n  '), ` ${ICON_ATTRS}`)
    .replace(`viewBox="0 0 24 24"`, `viewBox="${ic.viewBox}"`);
  write(path.join(OUT, 'icons/svg', `${ic.name}.svg`), master);
  for (const theme of ['light', 'dark']) {
    emitPng(master.replace(/currentColor/g, C[theme].ink), path.join(OUT, 'icons', theme), ic.name, 24);
  }
  manifest.groups.icons.items.push({ name: ic.name, referenced: usedNames.has(ic.name) });
}
console.log('icons:', icons.length, '| referenced by the app code:', manifest.groups.icons.items.filter(i => i.referenced).length);

/* ================= 2. ILLUSTRATIONS — HILLS / SUN / KITE ================= */
const artSrc = html.slice(html.indexOf('const pine = (x, y, s) =>'), html.indexOf('/* ---- 1. splash ----'));
const ART = new Function(artSrc + '\nreturn { pine, bush, TREES, HILLS, SUN, KITE };')();
const inner = s => s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();

const ILLUS = [
  { name: 'hills-splash', w: 393, h: 270, body: inner(ART.HILLS('tall')), dim: .14, note: 'welcome / splash horizon, with the stand of pines' },
  { name: 'hills-signin', w: 393, h: 270, body: inner(ART.HILLS('none')), dim: .14, note: 'sign-up / log-in / verify horizon, bare hills' },
  { name: 'sun', w: 104, h: 104, body: inner(ART.SUN), dim: .55, note: 'welcome-screen corner decoration' },
  { name: 'kite', w: 58, h: 58, body: inner(ART.KITE), dim: .55, note: 'auth-screen corner decoration' },
];
manifest.groups.illustrations = { note: 'transparent PNG, meant to sit on the sky gradient', items: [] };
for (const a of ILLUS) {
  for (const theme of ['light', 'dark']) {
    const body = theme === 'dark' ? `<g opacity="${a.dim}">${a.body}</g>` : a.body;
    const doc = svgDoc(a.w, a.h, body);
    write(path.join(OUT, 'illustrations/svg', `${a.name}-${theme}.svg`), doc);
    emitPng(doc, path.join(OUT, 'illustrations', theme), a.name, a.w);
  }
  manifest.groups.illustrations.items.push({ name: a.name, size: `${a.w}x${a.h}`, darkOpacity: a.dim, note: a.note });
}

/* ================= 3. SCREEN BACKGROUNDS (393 x 852) ================= */
const SCREEN_W = 393, SCREEN_H = 852;
function background(theme, kind) {
  const stops = theme === 'dark' ? SKY.dark : SKY[kind === 'signup' ? 'signup' : 'welcome'].light;
  const dimScene = theme === 'dark' ? ' opacity=".14"' : '';
  const dimDeco = theme === 'dark' ? ' opacity=".55"' : '';
  let body = `  <defs>${grad('sky', stops)}\n    <clipPath id="scene"><rect x="0" y="${SCREEN_H - (kind === 'signup' ? 200 : 270)}" width="${SCREEN_W}" height="${kind === 'signup' ? 200 : 270}"/></clipPath></defs>\n`;
  body += `  <rect width="${SCREEN_W}" height="${SCREEN_H}" fill="url(#sky)"/>\n`;
  if (kind === 'splash') return svgDoc(SCREEN_W, SCREEN_H, body.trimEnd());

  if (kind === 'welcome') {
    body += `  <g${dimDeco}><g transform="translate(${SCREEN_W - 14 - 104} 18)">${inner(ART.SUN)}</g></g>\n`;
    body += `  <circle cx="35.5" cy="131.5" r="3.5" fill="#2d7a4f" fill-opacity=".26"/>\n`;
    body += `  <circle cx="344.5" cy="200.5" r="4.5" fill="#f5a623" fill-opacity=".45"/>\n`;
    body += `  <circle cx="58.5" cy="252.5" r="2.5" fill="#f5a623" fill-opacity=".4"/>\n`;
    body += `  <g${dimScene} clip-path="url(#scene)"><g transform="translate(0 ${SCREEN_H - 270})">${inner(ART.HILLS('tall'))}</g></g>`;
  } else {
    body += `  <g${dimDeco}><g transform="translate(${SCREEN_W - 18 - 58} 16)">${inner(ART.KITE)}</g></g>\n`;
    // .bk-scene is 200 tall and the drawing is 270 with xMidYMax slice: bottom-aligned, top cropped
    body += `  <g${dimScene} clip-path="url(#scene)"><g transform="translate(0 ${SCREEN_H - 270})">${inner(ART.HILLS('none'))}</g></g>`;
  }
  return svgDoc(SCREEN_W, SCREEN_H, body);
}
const BGS = [
  { name: 'splash-bg', kind: 'splash', note: 'splash — sky only, the wordmark is drawn on top by the app' },
  { name: 'welcome-bg', kind: 'welcome', note: 'welcome — sky, sun, drifting dots, wooded horizon' },
  { name: 'signup-bg', kind: 'signup', note: 'sign up / log in / verify code — sky, kite, bare horizon' },
];
manifest.groups.backgrounds = { size: `${SCREEN_W}x${SCREEN_H} pt`, note: 'scale-to-fill, pinned to the bottom', items: [] };
for (const b of BGS) {
  for (const theme of ['light', 'dark']) {
    const doc = background(theme, b.kind);
    write(path.join(OUT, 'backgrounds/svg', `${b.name}-${theme}.svg`), doc);
    emitPng(doc, path.join(OUT, 'backgrounds', theme), b.name, SCREEN_W);
  }
  manifest.groups.backgrounds.items.push({ name: b.name, note: b.note });
}

/* ================= 4. SYSTEM / STATUS-BAR GLYPHS ================= */
const SYS = [];
for (const [name, re] of [
  ['status-signal', /const SB_SIGNAL = '([\s\S]*?)';/],
  ['status-wifi', /const SB_WIFI = '([\s\S]*?)';/],
  ['status-battery', /const SB_BATT = '([\s\S]*?)';/],
]) {
  const raw = html.match(re)[1];
  const w = +raw.match(/width="(\d+)"/)[1], h = +raw.match(/height="(\d+)"/)[1];
  SYS.push({ name, w, h, doc: raw.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"') });
}
manifest.groups.system = { note: 'prototype status-bar chrome — a real app gets these from the OS', items: [] };
for (const s of SYS) {
  write(path.join(OUT, 'system/svg', `${s.name}.svg`), s.doc);
  for (const theme of ['light', 'dark']) {
    emitPng(s.doc.replace(/currentColor/g, C[theme].ink), path.join(OUT, 'system', theme), s.name, s.w);
  }
  manifest.groups.system.items.push({ name: s.name, size: `${s.w}x${s.h}` });
}

/* ================= 5. CATEGORY PLACEHOLDER TILES ================= */
const CATS = [];
for (const m of html.matchAll(/\{ id: '([a-z]+)', name: '([^']+)', ic: '([a-z-]+)', tint: '[^']*', grad: 'from-([a-z]+-\d+) to-([a-z]+-\d+)'/g)) {
  CATS.push({ id: m[1], name: m[2], ic: m[3], from: m[4], to: m[5] });
}
const TW = {
  'emerald-500': '#10b981', 'teal-500': '#14b8a6', 'amber-500': '#f59e0b', 'orange-500': '#f97316',
  'blue-600': '#2563eb', 'indigo-700': '#4338ca', 'pink-500': '#ec4899', 'rose-500': '#f43f5e',
  'sky-600': '#0284c7', 'teal-600': '#0d9488', 'violet-600': '#7c3aed', 'fuchsia-600': '#c026d3',
  'emerald-600': '#059669', 'navy': '#1a2e4a', 'teal': '#1e8c7a',
};
const TILE_W = 360, TILE_H = 240;
function tile(fromC, toC, iconName) {
  const ic = icons.find(i => i.name === iconName);
  /* the watermark, as photoBox draws it on a full-width frame: a 90pt icon at
     white/20, rotated -8deg, hung off the corner by right:-16 bottom:-20 */
  const k = TILE_W / 393;
  const S = 90 * k;
  const x = TILE_W + 16 * k - S, y = TILE_H + 20 * k - S;
  const wm = ic
    ? `  <g opacity=".2" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(-8 ${(S / 2).toFixed(1)} ${(S / 2).toFixed(1)}) scale(${(S / 24).toFixed(4)})">
    <g ${ICON_ATTRS.replace('currentColor', '#ffffff')}>${ic.body}</g>
  </g>\n` : '';
  return svgDoc(TILE_W, TILE_H,
    `  <defs>${grad('g', [[fromC, 0], [toC, 1]], 1, 1)}</defs>\n` +
    `  <rect width="${TILE_W}" height="${TILE_H}" fill="url(#g)"/>\n` + wm);
}
manifest.groups.placeholders = { size: `${TILE_W}x${TILE_H} (3:2)`, note: 'shown when a photo is missing — identical in both themes', items: [] };
for (const cat of CATS) {
  const doc = tile(TW[cat.from], TW[cat.to], cat.ic);
  write(path.join(OUT, 'placeholders/svg', `photo-${cat.id}.svg`), doc);
  for (const theme of ['light', 'dark']) emitPng(doc, path.join(OUT, 'placeholders', theme), `photo-${cat.id}`, TILE_W);
  manifest.groups.placeholders.items.push({ name: `photo-${cat.id}`, category: cat.name, gradient: [TW[cat.from], TW[cat.to]] });
}
{ // the ad creative's own fallback: navy -> teal, left to right
  const doc = svgDoc(TILE_W, TILE_H, `  <defs>${grad('g', [['#1a2e4a', 0], ['#1e8c7a', 1]], 1, 0)}</defs>\n  <rect width="${TILE_W}" height="${TILE_H}" fill="url(#g)"/>`);
  write(path.join(OUT, 'placeholders/svg', 'ad-creative.svg'), doc);
  for (const theme of ['light', 'dark']) emitPng(doc, path.join(OUT, 'placeholders', theme), 'ad-creative', TILE_W);
  manifest.groups.placeholders.items.push({ name: 'ad-creative', category: 'banner ad fallback', gradient: ['#1a2e4a', '#1e8c7a'] });
}

/* ================= 6. BRAND ================= */
(async () => {
  const src = sharp(LOGO_PNG).ensureAlpha();
  const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: CH } = info;

  /* the app draws the wordmark with object-fit:cover into a 2.132:1 box at
     object-position center 40% — bake that crop so RN can drop it straight in */
  const AR = 1 / 0.469;                      // 238 x 112
  const cropH = Math.round(W / AR);
  const top = Math.round((H - cropH) * 0.40);
  const lockup = await sharp(LOGO_PNG).extract({ left: 0, top, width: W, height: cropH }).png().toBuffer();

  const brand = [];
  const emit = async (buf, theme, name, wPt) => {
    for (const d of DENSITIES) {
      const out = path.join(OUT, 'brand', theme, `${name}${suffix(d)}.png`);
      mk(path.dirname(out));
      await sharp(buf).resize({ width: Math.round(wPt * d) }).png({ compressionLevel: 9 }).toFile(out);
    }
  };

  /* dark variant: lift the brand green to the app's own dark-mode green
     (#6cc490, the colour .text-grass takes under [data-theme=dark]).
     Yellow and orange are left alone — they carry on a dark ground. */
  const recolor = async (buf) => {
    const im = sharp(buf).ensureAlpha();
    const { data: d, info: i } = await im.raw().toBuffer({ resolveWithObject: true });
    const tgt = [0x6c, 0xc4, 0x90];
    for (let p = 0; p < d.length; p += i.channels) {
      const [r, g, b, a] = [d[p], d[p + 1], d[p + 2], d[p + 3]];
      if (a < 8) continue;
      const green = g > r + 24 && g > b + 24 && r < 170;   // brand green, not the yellows
      if (!green) continue;
      d[p] = tgt[0]; d[p + 1] = tgt[1]; d[p + 2] = tgt[2];
    }
    return sharp(d, { raw: { width: i.width, height: i.height, channels: i.channels } }).png().toBuffer();
  };

  const lockupDark = await recolor(lockup);
  const fullDark = await recolor(fs.readFileSync(LOGO_PNG));

  await emit(lockup, 'light', 'wordmark', 238);
  await emit(lockupDark, 'dark', 'wordmark', 238);
  await emit(fs.readFileSync(LOGO_PNG), 'light', 'wordmark-full', 320);
  await emit(fullDark, 'dark', 'wordmark-full', 320);
  brand.push(
    { name: 'wordmark', size: '238x112 pt', note: 'the lockup exactly as the splash and welcome screens crop it' },
    { name: 'wordmark-full', size: '320x210 pt', note: 'the untouched CDN artwork, full bleed and margins' },
  );

  /* app icon — derived, not in the prototype: the hand mark on the theme ground.
     Label the warm (yellow / orange) shapes into connected blobs and drop the
     two swoosh arcs, which are the only wide-and-flat ones. What is left is the
     palm, its fingers and the three loose rays. */
  const warm = (p) => data[p + 3] > 60 && data[p] > 190 && data[p + 1] > 110 && data[p + 2] < 140;
  const label = new Int32Array(W * H).fill(-1);
  const blobs = [];
  for (let s = 0; s < W * H; s++) {
    if (label[s] !== -1 || !warm(s * CH)) continue;
    const id = blobs.length, stack = [s];
    label[s] = id;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
    while (stack.length) {
      const q = stack.pop(), qx = q % W, qy = (q / W) | 0;
      n++;
      if (qx < x0) x0 = qx; if (qx > x1) x1 = qx;
      if (qy < y0) y0 = qy; if (qy > y1) y1 = qy;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = qx + dx, ny = qy + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const t = ny * W + nx;
        if (label[t] !== -1 || !warm(t * CH)) continue;
        label[t] = id; stack.push(t);
      }
    }
    blobs.push({ id, x0, y0, x1, y1, n, w: x1 - x0 + 1, h: y1 - y0 + 1 });
  }
  const keep = blobs.filter(b => b.n > 200 && b.w / b.h < 2.5);   // the two arcs are ~5:1
  const drop = new Set(blobs.filter(b => !keep.includes(b)).map(b => b.id));
  const hand = { left: Math.min(...keep.map(b => b.x0)), top: Math.min(...keep.map(b => b.y0)) };
  hand.width = Math.max(...keep.map(b => b.x1)) - hand.left + 1;
  hand.height = Math.max(...keep.map(b => b.y1)) - hand.top + 1;
  console.log('warm blobs', blobs.map(b => `${b.w}x${b.h}:${b.n}`).join(' '), '-> hand', hand);

  /* rub out everything that is not the hand before cropping: the swoosh arcs
     that pass through the crop box, and the green of the wordmark below it —
     3px of dilation so their antialiased fringe goes with them */
  const clean = Buffer.from(data);
  const R = 3;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, p = i * CH;
    if (clean[p + 3] === 0) continue;
    const greenish = clean[p + 1] > clean[p] + 24 && clean[p + 1] > clean[p + 2] + 24 && clean[p] < 170;
    let near = false;
    for (let dy = -R; dy <= R && !near; dy++) for (let dx = -R; dx <= R; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      if (drop.has(label[ny * W + nx])) { near = true; break; }
    }
    if (greenish || near) clean[p + 3] = 0;
  }
  const handPng = await sharp(clean, { raw: { width: W, height: H, channels: CH } })
    .extract(hand).png().toBuffer();

  for (const theme of ['light', 'dark']) {
    const bg = theme === 'light' ? C.light.cream : '#0f1915';
    const S = 1024, inset = Math.round(S * 0.20);
    const art = await sharp(handPng).resize({ width: S - inset * 2, height: S - inset * 2, fit: 'inside' }).toBuffer();
    const meta = await sharp(art).metadata();
    const icon = await sharp({ create: { width: S, height: S, channels: 4, background: bg } })
      .composite([{ input: art, left: Math.round((S - meta.width) / 2), top: Math.round((S - meta.height) / 2) }])
      .png().toFile(path.join(OUT, 'brand', theme, 'app-icon-1024.png'));
    // transparent-ground mark, for anywhere the icon needs to sit on artwork
    await sharp(handPng).resize({ width: 512 }).png().toFile(path.join(OUT, 'brand', theme, 'mark-512.png'));
    void icon;
  }
  brand.push(
    { name: 'app-icon-1024', size: '1024x1024', derived: true, note: 'DERIVED — the prototype has no square launcher icon. Hand mark centred on the theme ground; confirm with design before shipping.' },
    { name: 'mark-512', size: '512 wide', derived: true, note: 'DERIVED — hand mark alone on transparency, same in both themes.' },
  );
  manifest.groups.brand = { note: 'wordmark is a hosted CDN PNG; ask design for the vector original', items: brand };

  /* ================= 7. TOKENS + MANIFEST ================= */
  write(path.join(OUT, 'tokens/colors.json'), JSON.stringify({
    light: C.light, dark: C.dark,
    sky: { welcomeLight: SKY.welcome.light, signupLight: SKY.signup.light, dark: SKY.dark },
    iconInk: { light: C.light.ink, dark: C.dark.ink },
    illustrationDarkOpacity: { hills: 0.14, sunAndKite: 0.55 },
  }, null, 2));
  write(path.join(OUT, 'tokens/gradients.json'), JSON.stringify({
    categories: Object.fromEntries(CATS.map(c => [c.id, { name: c.name, icon: c.ic, colors: [TW[c.from], TW[c.to]], direction: 'to bottom-right' }])),
    adCreative: { colors: ['#1a2e4a', '#1e8c7a'], direction: 'to right' },
  }, null, 2));

  manifest.generated = new Date().toISOString().slice(0, 10);
  manifest.densities = ['1x', '2x', '3x'];
  manifest.themes = ['light', 'dark'];
  write(path.join(OUT, 'MANIFEST.json'), JSON.stringify(manifest, null, 2));

  const count = (dir) => {
    let n = 0;
    (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(path.join(d, e.name)) : n++; })(dir);
    return n;
  };
  console.log('files written:', count(OUT));
})();
