// packages/ui/tailwind-preset.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // usar canales RGB para soportar opacidad de Tailwind (bg-surface/50, etc.)
        surface: 'rgb(var(--nx-color-surface) / <alpha-value>)',
        primary: 'rgb(var(--nx-color-primary) / <alpha-value>)',
        text: 'rgb(var(--nx-color-text) / <alpha-value>)',
      },
      borderRadius: {
        xl: 'var(--nx-radius-xl)',
        '2xl': 'var(--nx-radius-2xl)',
      },
      boxShadow: {
        glass: 'var(--nx-shadow-glass)',
      },
      spacing: {
        nx: 'var(--nx-spacing-base)',
      },
      fontFamily: {
        // v4 acepta string; también podrías usar array
        sans: 'var(--nx-font-sans)',
      },
    },
  },
};
