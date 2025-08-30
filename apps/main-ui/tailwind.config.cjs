module.exports = {
  presets: [require('@nexusg/ui/tailwind-preset.cjs')],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    '../../packages/ui/**/*.{ts,tsx,js,jsx,cjs}',
    './node_modules/@nexusg/ui/**/*.{js,cjs}',
  ],
  // habilitar si el proyecto usaba forms con v3:
  // plugins: [require('@tailwindcss/forms')],
};
