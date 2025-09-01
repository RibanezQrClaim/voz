// apps/main-ui/postcss.config.cjs
const path = require('path');

// Fuerza a resolver "tailwindcss" desde ESTE workspace (apps/main-ui),
// evitando que npm hoiste y resuelva la v4 de la raíz.
const tailwind = require(require.resolve('tailwindcss', { paths: [__dirname] }));
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    tailwind({
      config: path.join(__dirname, 'tailwind.config.cjs'),
    }),
    autoprefixer,
  ],
};
