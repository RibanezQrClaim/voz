// apps/main-ui/postcss.config.cjs
const path = require('path');

// Fuerza a resolver Tailwind desde este workspace (evita que se cuele v4 hoisted)
const tailwind = require(require.resolve('tailwindcss', { paths: [__dirname] }));
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    tailwind({ config: path.join(__dirname, 'tailwind.config.cjs') }),
    autoprefixer
  ]
};
