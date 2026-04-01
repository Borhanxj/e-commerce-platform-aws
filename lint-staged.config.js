const path = require('path')

module.exports = {
  'frontend/**/*.{js,jsx}': (files) => {
    const rel = files.map((f) => path.relative('frontend', f)).join(' ')
    return [
      `sh -c 'cd frontend && npx eslint ${rel}'`,
      `sh -c 'cd frontend && npx prettier --check ${rel}'`,
    ]
  },
  'backend/**/*.js': (files) => {
    const rel = files.map((f) => path.relative('backend', f)).join(' ')
    return [
      `sh -c 'cd backend && npx eslint ${rel}'`,
      `sh -c 'cd backend && npx prettier --check ${rel}'`,
    ]
  },
}
