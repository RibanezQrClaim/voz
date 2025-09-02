/** Tailwind v3 + PostCSS 8 */
module.exports = {
  plugins: {
    tailwindcss: { config: __dirname + '/tailwind.config.cjs' },
    autoprefixer: {},
  },
};
