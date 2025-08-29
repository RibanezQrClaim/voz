/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--nx-color-surface) / <alpha-value>)',
        primary: 'rgb(var(--nx-color-primary) / <alpha-value>)',
        text: 'rgb(var(--nx-color-text) / <alpha-value>)'
      },
      borderRadius: {
        xl: 'var(--nx-radius-xl)',
        '2xl': 'var(--nx-radius-2xl)'
      },
      boxShadow: {
        glass: 'var(--nx-shadow-glass)'
      },
      spacing: {
        base: 'var(--nx-spacing-base)'
      },
      fontFamily: {
        sans: 'var(--nx-font-sans)'
      }
    }
  },
  plugins: []
};
