module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are strictly prohibited.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'presentation-layer-boundaries',
      severity: 'error',
      comment:
        'Presentation layer code (apps/web) must not import worker or persistence adapters directly.',
      from: {
        path: '^apps/web',
      },
      to: {
        path: '(^apps/worker|^packages/persistence/src/.*)',
      },
    },
    {
      name: 'application-layer-boundaries',
      severity: 'error',
      comment:
        'Application layer packages must not depend on Presentation or Infrastructure adapters directly.',
      from: {
        path: '^packages/(contracts|authorization)',
      },
      to: {
        path: '(^apps/web|^apps/worker|^packages/persistence/src/.*)',
      },
    },
    {
      name: 'domain-layer-boundaries',
      severity: 'error',
      comment:
        'Domain layer core packages (kernel, events, validation, shared) must have no dependencies on Application, Presentation, or Infrastructure.',
      from: {
        path: '^packages/(kernel|events|validation|shared)',
      },
      to: {
        path: '(^apps/web|^apps/worker|^packages/contracts|^packages/authorization|^packages/persistence|^packages/configuration)',
      },
    },
    {
      name: 'infrastructure-layer-boundaries',
      severity: 'error',
      comment:
        'Infrastructure layer code (persistence, configuration, worker) must not depend on Presentation.',
      from: {
        path: '(^packages/persistence|^packages/configuration|^apps/worker)',
      },
      to: {
        path: '^apps/web',
      },
    },
    {
      name: 'question-bank-constraints',
      severity: 'error',
      comment: 'Question Bank cannot import from Assessment, Simulation, or AI.',
      from: {
        path: '^packages/domain/question-bank',
      },
      to: {
        path: '^packages/domain/(assessment|simulation|ai)',
      },
    },
    {
      name: 'ai-isolation-constraints',
      severity: 'error',
      comment: 'AI cannot import from Question Bank, Identity, or Persistence directly.',
      from: {
        path: '^packages/domain/ai',
      },
      to: {
        path: '(^packages/domain/(question-bank|identity-access)|^packages/persistence)',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
  },
};
