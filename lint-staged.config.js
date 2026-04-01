module.exports = {
  'frontend/src/**/*.{js,jsx}': (files) => [
    `npx --prefix frontend eslint ${files.join(' ')}`,
    `npx --prefix frontend prettier --check ${files.join(' ')}`,
  ],
  'backend/**/*.js': (files) => [
    `npx --prefix backend eslint ${files.join(' ')}`,
    `npx --prefix backend prettier --check ${files.join(' ')}`,
  ],
}
