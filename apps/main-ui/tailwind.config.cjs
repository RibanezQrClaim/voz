/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@nexusg/ui/tailwind-preset.cjs')],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
