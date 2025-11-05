module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("flowbite/plugin")],
};
