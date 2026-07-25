import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  DatabasePool,
  PostgresSecurityProfileRepository,
  PostgresSecuritySessionRepository,
  PostgresAuthenticationMethodRepository,
  PostgresTrustedDeviceRepository,
  PostgresRoleRepository,
  PostgresPermissionGroupRepository,
  PostgresUserRoleRepository,
  PostgresIdentityRepository,
  PostgresIdentityLookupService,
} from '@clasptek/persistence';
import {
  RegisterAuthPreferencesHandler,
  RecordLoginSessionHandler,
  LockAccountHandler,
  UnlockAccountHandler,
  RevokeLoginSessionHandler,
} from '@clasptek/application-auth';
import { AssignUserRoleHandler, GrantCapabilityHandler } from '@clasptek/application-authorization';
import {
  IdentitySynchronizer,
  EnsureUserAggregateExistsService,
} from '@clasptek/application-identity-sync';

interface AuthContext {
  dbPool: DatabasePool;
  logger: ConsoleLogger;
  securityProfileRepo: PostgresSecurityProfileRepository;
  sessionRepo: PostgresSecuritySessionRepository;
  methodRepo: PostgresAuthenticationMethodRepository;
  trustedDeviceRepo: PostgresTrustedDeviceRepository;
  roleRepo: PostgresRoleRepository;
  groupRepo: PostgresPermissionGroupRepository;
  userRoleRepo: PostgresUserRoleRepository;

  registerAuthPreferencesHandler: RegisterAuthPreferencesHandler;
  recordLoginSessionHandler: RecordLoginSessionHandler;
  lockAccountHandler: LockAccountHandler;
  unlockAccountHandler: UnlockAccountHandler;
  revokeLoginSessionHandler: RevokeLoginSessionHandler;
  assignUserRoleHandler: AssignUserRoleHandler;
  grantCapabilityHandler: GrantCapabilityHandler;
  identitySynchronizer: IdentitySynchronizer;
  ensureUserAggregateExistsService: EnsureUserAggregateExistsService;
}

let cachedAuthContext: AuthContext | null = null;
let pendingAuthContextPromise: Promise<AuthContext> | null = null;

export async function getAuthContext(): Promise<AuthContext> {
  if (cachedAuthContext) {
    return cachedAuthContext;
  }

  if (pendingAuthContextPromise) {
    return pendingAuthContextPromise;
  }

  pendingAuthContextPromise = (async () => {
    try {
      const config = loadEnvironment(process.env);
      const logger = new ConsoleLogger('AuthContextManager');
      const dbPool = new DatabasePool(config, logger);

      await dbPool.connect();

      const securityProfileRepo = new PostgresSecurityProfileRepository(dbPool);
      const sessionRepo = new PostgresSecuritySessionRepository(dbPool);
      const methodRepo = new PostgresAuthenticationMethodRepository(dbPool);
      const trustedDeviceRepo = new PostgresTrustedDeviceRepository(dbPool);
      const roleRepo = new PostgresRoleRepository(dbPool);
      const groupRepo = new PostgresPermissionGroupRepository(dbPool);
      const userRoleRepo = new PostgresUserRoleRepository(dbPool);

      const identityRepo = new PostgresIdentityRepository(dbPool);
      const lookupService = new PostgresIdentityLookupService(dbPool);

      cachedAuthContext = {
        dbPool,
        logger,
        securityProfileRepo,
        sessionRepo,
        methodRepo,
        trustedDeviceRepo,
        roleRepo,
        groupRepo,
        userRoleRepo,

        registerAuthPreferencesHandler: new RegisterAuthPreferencesHandler(securityProfileRepo),
        recordLoginSessionHandler: new RecordLoginSessionHandler(sessionRepo),
        lockAccountHandler: new LockAccountHandler(securityProfileRepo),
        unlockAccountHandler: new UnlockAccountHandler(securityProfileRepo),
        revokeLoginSessionHandler: new RevokeLoginSessionHandler(sessionRepo),
        assignUserRoleHandler: new AssignUserRoleHandler(roleRepo, userRoleRepo),
        grantCapabilityHandler: new GrantCapabilityHandler(roleRepo, groupRepo),
        identitySynchronizer: new IdentitySynchronizer(identityRepo, lookupService, logger),
        ensureUserAggregateExistsService: new EnsureUserAggregateExistsService(
          identityRepo,
          securityProfileRepo,
          logger
        ),
      };

      return cachedAuthContext;
    } catch (err) {
      pendingAuthContextPromise = null;
      throw err;
    }
  })();

  return pendingAuthContextPromise;
}
