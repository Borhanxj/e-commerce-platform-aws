module.exports = {
  'frontend/src/**/*.{js,jsx}': () => [
    'npm run lint --prefix frontend',
    'npm run format:check --prefix frontend',
  ],
  'backend/**/*.js': () => [
    'npm run lint --prefix backend',
    'npm run format:check --prefix backend',
  ],
}
