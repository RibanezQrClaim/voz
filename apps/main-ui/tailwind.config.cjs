/** @type {import('tailwindcss').Config} */
const nxPreset = require('@nexusg/ui/tailwind-preset.cjs');

module.exports = {
  presets: [nxPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',

    // escanear el UI kit (node_modules)
    './node_modules/@nexusg/ui/**/*.{js,jsx,ts,tsx}',

    // escanear el UI kit cuando se resuelve desde el workspace local
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/ui/dist/**/*.{js,jsx}',
  ],
  safelist: [
    // utilidades mínimas que deben existir aunque el escaneo falle
    'bg-surface', 'text-text', 'shadow-glass',
    'rounded-xl', 'rounded-2xl',
    'backdrop-blur-[14px]', 'border', 'border-white/40', 'bg-white/60',
    'px-3', 'py-2', 'focus:outline-none', 'focus:ring-2',
    'bg-red-500', 'text-white' // (para el smoke test de abajo)
  ],
  theme: { extend: {} },
  plugins: [],
};
