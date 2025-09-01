// apps/main-ui/postcss.config.cjs
const path = require('path');
const autoprefixer = require('autoprefixer');

const isCI = !!process.env.CI;
const plugins = [autoprefixer];

if (!isCI) {
  // En local, usa Tailwind v3 como plugin PostCSS
  const tailwind = require(require.resolve('tailwindcss', { paths: [__dirname] }));
  plugins.unshift(tailwind({ config: path.join(__dirname, 'tailwind.config.cjs') }));
}

module.exports = { plugins };
