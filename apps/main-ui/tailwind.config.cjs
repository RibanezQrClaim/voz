/** @type {import('tailwindcss').Config} */
const nxPreset = require('@nexusg/ui/tailwind-preset.cjs');

module.exports = {
  presets: [nxPreset],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
