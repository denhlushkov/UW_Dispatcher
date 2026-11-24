// Commit message standard: Conventional Commits (see standards/code-style.md#commits).
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'api',
        'catalog',
        'probes',
        'incident-engine',
        'notifications',
        'platform',
        'app',
        'deps',
        'docs',
        'ci',
        'lab1',
        'lab2',
        'lab3',
      ],
    ],
    'subject-case': [0],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
