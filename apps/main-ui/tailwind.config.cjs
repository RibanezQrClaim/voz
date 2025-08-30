/** @type {import('tailwindcss').Config} */
const nxPreset = require('@nexusg/ui/tailwind-preset.cjs');

module.exports = {
  presets: [nxPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // UI kit instalado desde node_modules
    './node_modules/@nexusg/ui/**/*.{js,jsx,ts,tsx}',
    // UI kit local en workspace (por si se resuelve directo durante dev)
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/ui/dist/**/*.{js,jsx}',
  ],
  // Pequeño salvavidas por si el escaneo falla en Windows
  safelist: [
    'bg-surface','text-text','shadow-glass',
    'rounded-xl','rounded-2xl',
    'backdrop-blur-[14px]','border','border-white/40','bg-white/60',
    'px-3','py-2','focus:outline-none','focus:ring-2',
    'bg-red-500','text-white'
  ],
  theme: { extend: {} },
  plugins: [],
};
