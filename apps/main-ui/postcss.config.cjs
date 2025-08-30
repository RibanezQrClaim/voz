const path = require('path');
module.exports = {
  plugins: [
    require('@tailwindcss/postcss')({
      config: path.join(__dirname, 'tailwind.config.cjs'),
    }),
    require('autoprefixer'),
  ],
};

