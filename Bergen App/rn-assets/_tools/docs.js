/* Generates assets.js, assets.svg.js and preview.html from what is on disk,
   so the maps can never drift from the folder. */
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..');
const M = JSON.parse(fs.readFileSync(path.join(OUT, 'MANIFEST.json'), 'utf8'));

const base = dir => fs.readdirSync(path.join(OUT, dir))
  .filter(f => f.endsWith('.png') && !/@[23]x\.png$/.test(f))
  .map(f => f.replace(/\.png$/, ''))
  .sort();

const GROUPS = [
  { key: 'icons', dir: 'icons', title: 'Icons', box: 24 },
  { key: 'illustrations', dir: 'illustrations', title: 'Illustrations', box: 200 },
  { key: 'backgrounds', dir: 'backgrounds', title: 'Screen backgrounds', box: 120 },
  { key: 'brand', dir: 'brand', title: 'Brand', box: 180 },
  { key: 'placeholders', dir: 'placeholders', title: 'Photo placeholders', box: 180 },
  { key: 'system', dir: 'system', title: 'System glyphs', box: 32 },
];
const ident = n => (/^[a-z][a-z0-9]*$/.test(n) ? n : `'${n}'`);
const camel = k => k[0].toUpperCase() + k.slice(1);

/* ---------- assets.js : PNG, works with no extra tooling ---------- */
let js = `/* Bergen Kids — React Native asset map. Generated; do not hand-edit.
 *
 *   import { Icons, resolve } from './rn-assets/assets';
 *   import { useColorScheme, Image } from 'react-native';
 *
 *   const scheme = useColorScheme();               // 'light' | 'dark'
 *   <Image source={resolve(Icons.home, scheme)} style={{ width: 24, height: 24 }} />
 *
 * Every asset exists under both themes, so resolve() can never miss.
 * Metro picks the @2x / @3x file for the device on its own.
 */

export const resolve = (asset, scheme) => asset[scheme === 'dark' ? 'dark' : 'light'];

`;
for (const g of GROUPS) {
  const names = base(`${g.dir}/light`);
  js += `export const ${camel(g.key)} = {\n`;
  for (const n of names) {
    js += `  ${ident(n)}: { light: require('./${g.dir}/light/${n}.png'), dark: require('./${g.dir}/dark/${n}.png') },\n`;
  }
  js += `};\n\n`;
}
js += `export default { ${GROUPS.map(g => camel(g.key)).join(', ')}, resolve };\n`;
fs.writeFileSync(path.join(OUT, 'assets.js'), js);

/* ---------- assets.svg.js : vector, needs react-native-svg-transformer ---------- */
let svgjs = `/* Vector variants. Requires react-native-svg + react-native-svg-transformer.
 * Icons are stroke-only and use currentColor, so one component covers every
 * colour and both themes:
 *
 *   import { IconsSvg } from './rn-assets/assets.svg';
 *   const Home = IconsSvg.home;
 *   <Home width={21} height={21} color="#2d7a4f" />
 *
 * The illustrations are already themed, so they come as { light, dark } pairs.
 */

export const IconsSvg = {
`;
for (const n of fs.readdirSync(path.join(OUT, 'icons/svg')).map(f => f.replace('.svg', '')).sort()) {
  svgjs += `  ${ident(n)}: require('./icons/svg/${n}.svg').default,\n`;
}
svgjs += `};\n\n`;
for (const [name, dir] of [['IllustrationsSvg', 'illustrations/svg'], ['BackgroundsSvg', 'backgrounds/svg']]) {
  const files = fs.readdirSync(path.join(OUT, dir)).filter(f => f.endsWith('.svg'));
  const stems = [...new Set(files.map(f => f.replace(/-(light|dark)\.svg$/, '')))].sort();
  svgjs += `export const ${name} = {\n`;
  for (const s of stems) {
    svgjs += `  ${ident(s)}: { light: require('./${dir}/${s}-light.svg').default, dark: require('./${dir}/${s}-dark.svg').default },\n`;
  }
  svgjs += `};\n\n`;
}
svgjs += `export const PlaceholdersSvg = {\n`;
for (const f of fs.readdirSync(path.join(OUT, 'placeholders/svg')).filter(f => f.endsWith('.svg')).sort()) {
  svgjs += `  ${ident(f.replace('.svg', ''))}: require('./placeholders/svg/${f}').default,\n`;
}
svgjs += `};\n\nexport default { IconsSvg, IllustrationsSvg, BackgroundsSvg, PlaceholdersSvg };\n`;
fs.writeFileSync(path.join(OUT, 'assets.svg.js'), svgjs);

/* ---------- preview.html : the contact sheet ---------- */
const iconMeta = Object.fromEntries(M.groups.icons.items.map(i => [i.name, i]));
let sections = '';
let total = 0;
for (const g of GROUPS) {
  const names = base(`${g.dir}/light`);
  total += names.length;
  // keyed by group, because an icon and an illustration can share a name (sun)
  const NATURAL = {
    illustrations: { 'hills-splash': 393, 'hills-signin': 393, sun: 104, kite: 58 },
    backgrounds: { 'splash-bg': 131, 'welcome-bg': 131, 'signup-bg': 131 },
    brand: { wordmark: 238, 'wordmark-full': 260, 'app-icon-1024': 180, 'mark-512': 140 },
    system: { 'status-signal': 34, 'status-wifi': 32, 'status-battery': 52 },
  };
  const natural = NATURAL[g.key] || {};
  const cells = names.map(n => {
    const meta = g.key === 'icons' ? iconMeta[n] : null;
    const faded = meta && !meta.referenced ? ' class="faded"' : '';
    const w = natural[n] || g.box;
    // @3x where it exists, so the sheet stays crisp on a retina screen
    const hi = fs.existsSync(path.join(OUT, g.dir, 'light', `${n}@3x.png`)) ? '@3x' : '';
    return `<figure${faded}><div class="frame">
      <img data-src="${g.dir}/THEME/${n}${hi}.png" width="${w}" alt="${n}">
    </div><figcaption>${n}${meta && !meta.referenced ? '<em>not referenced</em>' : ''}</figcaption></figure>`;
  }).join('\n');
  sections += `<section><h2>${g.title} <span>${names.length}</span></h2><div class="grid ${g.key}">${cells}</div></section>\n`;
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Bergen Kids — asset pack</title>
<style>
  :root { --bg:#f4f7fa; --panel:#fff; --ink:#1a2e4a; --muted:#54637a; --line:#e7ecf1; }
  body.dark { --bg:#0f1915; --panel:#17241e; --ink:#e9f2ec; --muted:#a0b4a8; --line:rgba(255,255,255,.11); }
  * { box-sizing: border-box }
  body { margin:0; padding:0 0 60px; font:15px/1.5 Inter,system-ui,sans-serif; background:var(--bg); color:var(--ink); transition:background .2s }
  header { position:sticky; top:0; z-index:5; display:flex; align-items:center; gap:16px;
           padding:14px 28px; background:var(--panel); border-bottom:1px solid var(--line) }
  h1 { font-size:16px; margin:0; font-weight:700 }
  header p { margin:0; color:var(--muted); font-size:13px; flex:1 }
  button { font:600 13px Inter,system-ui,sans-serif; padding:8px 16px; border-radius:999px;
           border:1px solid var(--line); background:var(--panel); color:var(--ink); cursor:pointer }
  button.on { background:#2d7a4f; border-color:#2d7a4f; color:#fff }
  section { padding:26px 28px 6px }
  h2 { font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin:0 0 14px }
  h2 span { background:var(--line); color:var(--ink); border-radius:999px; padding:2px 8px; font-size:11px; margin-left:6px }
  .grid { display:grid; gap:14px; grid-template-columns:repeat(auto-fill,minmax(108px,1fr)) }
  .grid.illustrations, .grid.placeholders, .grid.brand { grid-template-columns:repeat(auto-fill,minmax(220px,1fr)) }
  .grid.backgrounds { grid-template-columns:repeat(auto-fill,minmax(150px,1fr)) }
  figure { margin:0; background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:12px; text-align:center }
  .frame { display:grid; place-items:center; min-height:64px }
  .grid.backgrounds .frame img { max-height:260px; width:auto }
  .grid.illustrations img, .grid.placeholders img, .grid.brand img { max-width:100% }
  figcaption { margin-top:8px; font-size:11.5px; color:var(--muted); overflow-wrap:anywhere }
  figcaption em { display:block; color:#c07a2a; font-style:normal; font-size:10.5px }
  .grid.illustrations img, .grid.brand img, .grid.placeholders img { image-rendering:auto }
  .faded { opacity:.5 }
</style></head>
<body>
<header>
  <h1>Bergen Kids — asset pack</h1>
  <p>${total} assets · every one in light and dark · @1x / @2x / @3x</p>
  <button id="t-light" class="on">Light</button><button id="t-dark">Dark</button>
</header>
${sections}
<script>
  function paint(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    document.getElementById('t-light').classList.toggle('on', theme === 'light');
    document.getElementById('t-dark').classList.toggle('on', theme === 'dark');
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src.replace('THEME', theme);
    });
  }
  document.getElementById('t-light').onclick = () => paint('light');
  document.getElementById('t-dark').onclick = () => paint('dark');
  paint('light');
</script>
</body></html>
`;
fs.writeFileSync(path.join(OUT, 'preview.html'), html);
console.log('assets.js, assets.svg.js, preview.html written —', total, 'named assets');
