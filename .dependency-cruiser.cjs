// Module boundaries as code. Every rule maps to a section of spec.md §3 "Межі модулів";
// changing a rule requires changing the spec (and an ADR if the boundary itself moves).
const TEST_FILE = '\\.test\\.ts$';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ---------- generic hygiene ----------
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Cycles make module order undefined and block extraction of a module into a service.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'error',
      comment: 'A file nobody imports and that imports nothing is dead code.',
      from: { orphan: true, pathNot: ['\\.d\\.ts$', '^src/app/[^/]+\\.main\\.ts$'] },
      to: {},
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-undeclared-packages',
      severity: 'error',
      comment: 'Every npm import must be declared in package.json (no transitive leaks).',
      from: {},
      to: { dependencyTypes: ['npm-no-pkg', 'npm-unknown'] },
    },
    {
      name: 'no-dev-deps-in-runtime',
      severity: 'error',
      comment:
        'Runtime code must not need devDependencies (they are absent in the production image).',
      from: { path: '^src/', pathNot: TEST_FILE },
      to: { dependencyTypes: ['npm-dev'], dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'no-tests-from-runtime',
      severity: 'error',
      from: { path: '^src/', pathNot: TEST_FILE },
      to: { path: ['^test/', TEST_FILE] },
    },

    // ---------- layers: shared < platform < modules < api < app ----------
    {
      name: 'shared-is-pure',
      severity: 'error',
      comment: 'shared/ is the dependency-free kernel (types, pure helpers).',
      from: { path: '^src/shared/', pathNot: TEST_FILE },
      to: { pathNot: '^src/shared/' },
    },
    {
      name: 'platform-knows-no-business',
      severity: 'error',
      comment:
        'platform/ is technical infrastructure (env, logger, db, queue); it must not know modules.',
      from: { path: '^src/platform/' },
      to: { path: '^src/(modules|api|app)/' },
    },
    {
      name: 'modules-know-no-transport',
      severity: 'error',
      comment:
        'Business modules are transport-agnostic: they are reused by the API and the worker.',
      from: { path: '^src/modules/' },
      to: { path: '^src/(api|app)/' },
    },
    {
      name: 'api-does-not-know-composition-root',
      severity: 'error',
      from: { path: '^src/api/' },
      to: { path: '^src/app/' },
    },

    // ---------- module encapsulation ----------
    {
      name: 'module-public-api-only',
      severity: 'error',
      comment: 'Another module may be reached only through its index.ts (public API).',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/[^/]+/.+',
        pathNot: ['^src/modules/$1/', '^src/modules/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'outer-layers-use-public-api',
      severity: 'error',
      from: { path: '^src/(api|app)/' },
      to: { path: '^src/modules/[^/]+/.+', pathNot: '^src/modules/[^/]+/index\\.ts$' },
    },

    // ---------- data-flow direction: catalog <- probes <- incident-engine <- notifications ----------
    {
      name: 'catalog-is-upstream',
      severity: 'error',
      comment: 'Configuration must not depend on the runtime pipeline.',
      from: { path: '^src/modules/catalog/' },
      to: { path: '^src/modules/(probes|incident-engine|notifications)/' },
    },
    {
      name: 'probes-do-not-know-consumers',
      severity: 'error',
      comment: 'probes publish CheckResult through a port; consumers are wired in app/.',
      from: { path: '^src/modules/probes/' },
      to: { path: '^src/modules/(incident-engine|notifications)/' },
    },
    {
      name: 'incident-engine-does-not-send',
      severity: 'error',
      comment: 'incident-engine records IncidentEvent facts (outbox); notifications consume them.',
      from: { path: '^src/modules/incident-engine/' },
      to: { path: '^src/modules/notifications/' },
    },
    {
      name: 'notifications-do-not-probe',
      severity: 'error',
      from: { path: '^src/modules/notifications/' },
      to: { path: '^src/modules/probes/' },
    },

    // ---------- purity of domain code ----------
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment: 'domain/ holds rules and types only: no IO, no frameworks, no infrastructure.',
      from: { path: '^src/modules/[^/]+/domain/', pathNot: TEST_FILE },
      to: {
        pathNot: ['^src/shared/', '^src/modules/[^/]+/domain/', '^src/modules/[^/]+/index\\.ts$'],
      },
    },

    // ---------- third-party libraries are confined to their adapters ----------
    {
      name: 'http-framework-only-in-api',
      severity: 'error',
      from: { pathNot: '^src/(api|app)/' },
      to: { path: '^node_modules/(fastify|@fastify/)' },
    },
    {
      name: 'sql-only-in-repositories',
      severity: 'error',
      comment: 'SQL and transactions live only in *.repository.ts and platform/db (lab 2).',
      from: { pathNot: ['\\.repository\\.ts$', '^src/platform/db/'] },
      to: { path: '^node_modules/(postgres|pg|kysely|drizzle-orm)/' },
    },
    {
      name: 'queue-only-in-platform',
      severity: 'error',
      comment: 'BullMQ/Redis are hidden behind platform/queue ports (adr/0002).',
      from: { pathNot: '^src/platform/queue/' },
      to: { path: '^node_modules/(bullmq|ioredis)/' },
    },
    {
      name: 'logger-impl-only-in-platform',
      severity: 'error',
      comment: 'Code logs through platform/logger so every line carries the business-process id.',
      from: { pathNot: '^src/platform/' },
      to: { path: '^node_modules/pino/', dependencyTypesNot: ['type-only'] },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    skipAnalysisNotInRules: true,
  },
};
