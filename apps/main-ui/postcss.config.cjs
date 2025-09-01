// apps/main-ui/postcss.config.cjs
const path = require('path');

module.exports = {
  plugins: [
    // Tailwind v3: el plugin es "tailwindcss" (NO @tailwindcss/postcss)
    require('tailwindcss')({
      config: path.join(__dirname, 'tailwind.config.cjs'),
    }),
    require('autoprefixer'),
  ],
};

