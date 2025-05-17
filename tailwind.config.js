const flowbiteReact = require("flowbite-react/plugin/tailwindcss");

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite/**/*.{js,jsx,ts,tsx}',
    ".flowbite-react/class-list.json"
  ],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin'), flowbiteReact],
};