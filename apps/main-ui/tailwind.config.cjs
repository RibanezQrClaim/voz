const path = require('path');

module.exports = {
  presets: [require('@nexusg/ui/tailwind-preset.cjs')],
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{ts,tsx,js,jsx}'),
    path.join(__dirname, 'src/figma/**/*.{ts,tsx}'),
    path.join(__dirname, 'src/skins/**/*.{ts,tsx,css}'),
    path.join(__dirname, '../../packages/ui/src/**/*.{ts,tsx,js,jsx}'),
  ],
  theme: { extend: {} },
  plugins: [],
};

