Set-Content packages\ui\tailwind-preset.cjs @'
/** @type {import("tailwindcss").Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: "var(--nx-color-surface)",
        primary: "var(--nx-color-primary)",
        text: "var(--nx-color-text)"
      },
      borderRadius: {
        xl: "var(--nx-radius-xl)",
        "2xl": "var(--nx-radius-2xl)"
      },
      boxShadow: {
        glass: "var(--nx-shadow-glass)"
      }
    }
  },
  plugins: []
};
'@
