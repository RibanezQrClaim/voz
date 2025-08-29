import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const figmaDir = path.join(repoRoot, 'figma/style-guide');
const stylesPath = path.join(__dirname, '../dist/styles.css');
const presetPath = path.join(__dirname, '../tailwind-preset.cjs');

async function getCssFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      files.push(...await getCssFiles(res));
    } else if (entry.isFile() && res.endsWith('.css')) {
      files.push(res);
    }
  }
  return files;
}

async function readTokens() {
  const files = await getCssFiles(figmaDir);
  const tokens = {};
  const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    let match;
    while ((match = varRegex.exec(content))) {
      const name = `--${match[1]}`;
      if (!(name in tokens)) {
        tokens[name] = match[2].trim();
      }
    }
  }
  return tokens;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(ch => ch + ch).join('');
  }
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r} ${g} ${b}`;
}

function oklchToRgb(value) {
  const parts = value
    .replace(/oklch\(|\)/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(parseFloat);
  const [L, C, H = 0] = parts;
  const hRad = (H * Math.PI) / 180;
  const a = Math.cos(hRad) * C;
  const b = Math.sin(hRad) * C;
  const l = L;
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;
  let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let b2 = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  const clamp = x => Math.max(0, Math.min(1, x));
  r = Math.round(clamp(r) * 255);
  g = Math.round(clamp(g) * 255);
  b2 = Math.round(clamp(b2) * 255);
  return `${r} ${g} ${b2}`;
}

function colorToRgb(value) {
  if (value.startsWith('#')) return hexToRgb(value);
  if (value.startsWith('rgb')) {
    return value
      .replace(/rgba?\(|\)/g, '')
      .split(',')
      .slice(0, 3)
      .map(v => v.trim())
      .join(' ');
  }
  if (value.startsWith('oklch')) return oklchToRgb(value);
  return value;
}

function evaluateCalc(value, tokens) {
  const calcMatch = value.match(/^calc\(var\((--[\w-]+)\)\s*([+-])\s*([0-9.]+)(px|rem)\)$/);
  if (!calcMatch) return value;
  const [, varName, op, num, unit] = calcMatch;
  const baseVal = tokens[varName];
  if (!baseVal) return value;
  const baseMatch = baseVal.match(/^([0-9.]+)(px|rem)$/);
  if (!baseMatch) return value;
  let [ , baseNum, baseUnit] = baseMatch;
  baseNum = parseFloat(baseNum);
  let resultPx;
  if (baseUnit === 'rem') {
    resultPx = baseNum * 16;
  } else {
    resultPx = baseNum;
  }
  let adjust = parseFloat(num);
  if (unit === 'rem') adjust *= 16;
  if (op === '+') resultPx += adjust; else resultPx -= adjust;
  const resultRem = resultPx / 16;
  return `${resultRem}rem`;
}

async function updateStyles(tokens) {
  let existing = '';
  try {
    existing = await fs.readFile(stylesPath, 'utf8');
  } catch {}
  const mapping = {
    '--nx-color-surface': '--background',
    '--nx-color-primary': '--primary',
    '--nx-color-text': '--foreground',
    '--nx-radius-xl': '--radius-xl',
    '--nx-radius-2xl': '--radius-2xl',
    '--nx-spacing-base': '--spacing',
    '--nx-shadow-glass': '--shadow-glass',
    '--nx-font-sans': '--font-sans'
  };
  const updatedVars = {};
  const updated = [];
  const defaults = [];

  for (const [nxVar, figmaVar] of Object.entries(mapping)) {
    let value = tokens[figmaVar];
    if (value) {
      if (nxVar.startsWith('--nx-color-')) {
        value = colorToRgb(value);
      } else if (nxVar.startsWith('--nx-radius-')) {
        value = evaluateCalc(value, tokens);
      }
      if (/^\./.test(value)) value = `0${value}`;
      updatedVars[nxVar] = value;
      updated.push(nxVar);
    } else {
      const match = existing.match(new RegExp(`${nxVar}:\\s*([^;]+);`));
      if (match) {
        updatedVars[nxVar] = match[1].trim();
      } else if (nxVar === '--nx-shadow-glass') {
        updatedVars[nxVar] = '0 4px 30px rgba(0, 0, 0, 0.1)';
      }
      defaults.push(nxVar);
    }
  }

  const content = `:root {\n` +
    Object.entries(updatedVars).map(([k, v]) => `  ${k}: ${v};`).join('\n') +
    `\n}\n`;
  await fs.writeFile(stylesPath, content);
  console.log('Updated:', updated.length ? updated.join(', ') : 'none');
  if (defaults.length) {
    const kept = defaults.filter(v => !updated.includes(v));
    if (kept.length) console.log('Defaults:', kept.join(', '));
  }
}

async function updatePreset() {
  const content = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        surface: 'rgb(var(--nx-color-surface) / <alpha-value>)',\n        primary: 'rgb(var(--nx-color-primary) / <alpha-value>)',\n        text: 'rgb(var(--nx-color-text) / <alpha-value>)'\n      },\n      borderRadius: {\n        xl: 'var(--nx-radius-xl)',\n        '2xl': 'var(--nx-radius-2xl)'\n      },\n      boxShadow: {\n        glass: 'var(--nx-shadow-glass)'\n      },\n      spacing: {\n        base: 'var(--nx-spacing-base)'\n      },\n      fontFamily: {\n        sans: 'var(--nx-font-sans)'\n      }\n    }\n  },\n  plugins: []\n};\n`;
  await fs.writeFile(presetPath, content);
}

async function main() {
  const tokens = await readTokens();
  await updateStyles(tokens);
  await updatePreset();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
