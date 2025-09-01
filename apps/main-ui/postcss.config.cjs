// apps/main-ui/postcss.config.cjs
const path = require('path');
const autoprefixer = require('autoprefixer');

// En CI compilamos Tailwind con el CLI (workflow) para evitar que se cuele v4 como plugin.
// Por eso aquí deshabilitamos el plugin de Tailwind cuando CI=1.
const isCI = !!process.env.CI;

const plugins = [autoprefixer];

if (!isCI) {
  // Local: usar Tailwind v3 como plugin de PostCSS, resolviéndolo desde ESTE workspace
  // para evitar hoisting a una v4 en la raíz del monorepo.
  const tailwind = require(require.resolve('tailwindcss', { paths: [__dirname] }));
  plugins.unshift(tailwind({ config: path.join(__dirname, 'tailwind.config.cjs') }));
}

module.exports = { plugins };
