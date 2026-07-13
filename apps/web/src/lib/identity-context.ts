import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  DatabasePool,
  PostgresIdentityRepository,
  PostgresIdentityLookupService,
} from '@clasptek/persistence';
import {
  CreateUserHandler,
  UpdateProfileHandler,
  ArchiveUserHandler,
  RestoreUserHandler,
} from '@clasptek/application-identity';

interface IdentityContext {
  repository: PostgresIdentityRepository;
  lookupService: PostgresIdentityLookupService;
  createUserHandler: CreateUserHandler;
  updateProfileHandler: UpdateProfileHandler;
  archiveUserHandler: ArchiveUserHandler;
  restoreUserHandler: RestoreUserHandler;
  logger: ConsoleLogger;
  dbPool: DatabasePool;
}

let cachedContext: IdentityContext | null = null;

export async function getIdentityContext(): Promise<IdentityContext> {
  if (cachedContext) {
    return cachedContext;
  }

  // Lazy validate environments on execution rather than module import
  const config = loadEnvironment(process.env);
  const logger = new ConsoleLogger('IdentityContextManager');
  const dbPool = new DatabasePool(config, logger);

  await dbPool.connect();
  const repository = new PostgresIdentityRepository(dbPool);
  const lookupService = new PostgresIdentityLookupService(dbPool);

  cachedContext = {
    repository,
    lookupService,
    createUserHandler: new CreateUserHandler(repository, lookupService),
    updateProfileHandler: new UpdateProfileHandler(repository),
    archiveUserHandler: new ArchiveUserHandler(repository),
    restoreUserHandler: new RestoreUserHandler(repository),
    logger,
    dbPool,
  };

  return cachedContext;
}
