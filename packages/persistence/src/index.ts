import { Pool } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { ServerEnvironment } from '@clasptek/configuration';
import { Logger } from '@clasptek/observability';
import {
  SecuritySession,
  SecuritySessionRepository,
  AuthenticationMethod,
  AuthenticationMethodRepository,
  TrustedDevice,
  TrustedDeviceRepository,
  DeviceFingerprint,
} from '@clasptek/domain-auth';
import { SecurityProfile, SecurityProfileRepository, LockStatus } from '@clasptek/domain-security';
import {
  Role,
  RoleRepository,
  PermissionGroup,
  PermissionGroupRepository,
  Permission,
  UserRole,
  UserRoleRepository,
} from '@clasptek/domain-authorization';

/**
 * @domain Database
 * @adapter Postgres
 * Persistence, Postgres pool connection management, and Supabase adapter creators
 */

export interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<void>;
  delete?(id: TId): Promise<void>;
}

export class DatabasePool {
  private pool: Pool | null = null;
  private isConnected = false;

  constructor(
    private readonly config: ServerEnvironment,
    private readonly logger: Logger
  ) {}

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    this.logger.info('Initializing Postgres database connection pool...');
    try {
      this.pool = new Pool({
        connectionString: this.config.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      // Try to acquire a client from the pool to verify database reachability
      const client = await this.pool.connect();
      client.release();
      this.isConnected = true;
      this.logger.info('Postgres database connection pool successfully established.');
    } catch (err: any) {
      this.logger.error('Failed to establish database connection pool', err);
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    this.logger.info('Closing Postgres database connection pool...');
    await this.pool.end();
    this.isConnected = false;
    this.pool = null;
  }

  public getStatus(): boolean {
    return this.isConnected;
  }

  public getPool(): Pool {
    if (!this.pool) {
      throw new Error('Pool is not initialized. Connect to the database first.');
    }
    return this.pool;
  }
}

/**
 * Creates a browser-safe Supabase client (only uses public non-privileged credentials)
 */
export function createSupabaseBrowserClient(url: string, anonKey: string): SupabaseClient {
  return createBrowserClient(url, anonKey);
}

export interface NextCookiesAdapter {
  getAll(): { name: string; value: string }[];
  setAll(cookiesToSet: { name: string; value: string; options: any }[]): void;
}

/**
 * Creates a server-side Supabase client with cookie storage support (NextJS context)
 */
export function createSupabaseServerClient(
  url: string,
  anonKey: string,
  cookieStore: NextCookiesAdapter
): SupabaseClient {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any[]) {
        try {
          cookieStore.setAll(cookiesToSet);
        } catch {
          // Handled if invoked in server page render context where cookies are immutable
        }
      },
    },
  });
}

/**
 * Creates a super-admin service client. Restrict to trusted servers and worker environments.
 */
export function createSupabaseAdminClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Postgres Implementation of the Identity Bounded Context Query Contracts
 */
import {
  User as DomainUser,
  UserId,
  Identity as DomainIdentity,
  IdentityId,
  Profile as DomainProfile,
  ProfileId,
  EmailAddress,
  PersonName,
  IdentityProvider,
  UserStatus,
  IdentityRepository,
} from '@clasptek/domain-identity';
import { IdentityLookupService } from '@clasptek/application-identity';

export class PostgresIdentityLookupService implements IdentityLookupService {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByLoginIdentifier(loginIdentifier: string): Promise<string | null> {
    const pool = this.dbPool.getPool();
    const query = 'SELECT user_id FROM identities WHERE login_identifier = $1 LIMIT 1';
    const res = await pool.query(query, [loginIdentifier]);
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0].user_id;
  }
}

export class PostgresIdentityRepository implements IdentityRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: UserId): Promise<DomainUser | null> {
    const pool = this.dbPool.getPool();

    // 1. Fetch User state
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [
      id.value,
    ]);
    if (userRes.rows.length === 0) {
      return null;
    }
    const userRow = userRes.rows[0];

    // 2. Fetch User Identities
    const identRes = await pool.query(
      'SELECT * FROM identities WHERE user_id = $1 AND deleted_at IS NULL',
      [id.value]
    );
    const identities = identRes.rows.map((row) => {
      return new DomainIdentity(
        new IdentityId(row.id),
        new EmailAddress(row.email),
        row.provider as IdentityProvider,
        row.is_verified,
        row.login_identifier
      );
    });

    // 3. Fetch User Profile
    const profRes = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1 AND deleted_at IS NULL',
      [id.value]
    );
    let profile: DomainProfile | null = null;
    if (profRes.rows.length > 0) {
      const pRow = profRes.rows[0];
      profile = new DomainProfile(
        new ProfileId(pRow.id),
        new PersonName(pRow.first_name),
        new PersonName(pRow.last_name),
        pRow.avatar || undefined,
        pRow.locale,
        pRow.time_zone
      );
    }

    return new DomainUser(
      new UserId(userRow.id),
      userRow.status as UserStatus,
      identities,
      profile,
      userRow.version
    );
  }

  public async save(user: DomainUser): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Optimistic concurrency verification check
      const checkRes = await client.query('SELECT version FROM users WHERE id = $1 FOR UPDATE', [
        user.id.value,
      ]);

      if (checkRes.rows.length > 0) {
        const currentVersion = checkRes.rows[0].version;
        if (currentVersion !== user.version) {
          throw new Error('Optimistic lock error: Aggregate version mismatch');
        }
      }

      // 1. Insert or update User aggregate root
      const userUpsertQuery = `
        INSERT INTO users (id, status, version, updated_at, archived_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          version = EXCLUDED.version,
          updated_at = CURRENT_TIMESTAMP,
          archived_at = EXCLUDED.archived_at
      `;
      const archivedAt = user.status === 'ARCHIVED' ? new Date() : null;
      await client.query(userUpsertQuery, [user.id.value, user.status, user.version, archivedAt]);

      // 2. Save bound Identities
      for (const identity of user.identities) {
        const identUpsertQuery = `
          INSERT INTO identities (id, user_id, email, provider, is_verified, login_identifier, version, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            provider = EXCLUDED.provider,
            is_verified = EXCLUDED.is_verified,
            login_identifier = EXCLUDED.login_identifier,
            version = EXCLUDED.version,
            updated_at = CURRENT_TIMESTAMP
        `;
        await client.query(identUpsertQuery, [
          identity.id.value,
          user.id.value,
          identity.email.value,
          identity.provider,
          identity.isVerified,
          identity.loginIdentifier,
          user.version,
        ]);
      }

      // 3. Save Profile
      if (user.profile) {
        const profileUpsertQuery = `
          INSERT INTO profiles (id, user_id, first_name, last_name, avatar, locale, time_zone, version, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            avatar = EXCLUDED.avatar,
            locale = EXCLUDED.locale,
            time_zone = EXCLUDED.time_zone,
            version = EXCLUDED.version,
            updated_at = CURRENT_TIMESTAMP
        `;
        await client.query(profileUpsertQuery, [
          user.profile.id.value,
          user.id.value,
          user.profile.firstName.value,
          user.profile.lastName.value,
          user.profile.avatar || null,
          user.profile.locale,
          user.profile.timeZone,
          user.version,
        ]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export class PostgresSecurityProfileRepository implements SecurityProfileRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<SecurityProfile | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM security_profiles WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new SecurityProfile(
      r.id,
      r.user_id,
      r.preferred_mfa,
      r.failed_attempts,
      r.lock_status as LockStatus,
      r.security_preferences || {},
      r.version,
      r.created_at,
      r.updated_at
    );
  }

  public async findByUserId(userId: string): Promise<SecurityProfile | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM security_profiles WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new SecurityProfile(
      r.id,
      r.user_id,
      r.preferred_mfa,
      r.failed_attempts,
      r.lock_status as LockStatus,
      r.security_preferences || {},
      r.version,
      r.created_at,
      r.updated_at
    );
  }

  public async save(profile: SecurityProfile): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO security_profiles (id, user_id, preferred_mfa, failed_attempts, lock_status, security_preferences, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        preferred_mfa = EXCLUDED.preferred_mfa,
        failed_attempts = EXCLUDED.failed_attempts,
        lock_status = EXCLUDED.lock_status,
        security_preferences = EXCLUDED.security_preferences,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      profile.id,
      profile.userId,
      profile.preferredMfa,
      profile.failedAttempts,
      profile.lockStatus,
      profile.securityPreferences,
      profile.version,
    ]);
  }
}

export class PostgresSecuritySessionRepository implements SecuritySessionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<SecuritySession | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM security_sessions WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new SecuritySession(
      r.id,
      r.user_id,
      r.supabase_session_id,
      r.browser,
      r.ip_address,
      r.country,
      r.device,
      r.user_agent,
      r.login_timestamp,
      r.revoked_by_admin,
      r.version,
      r.created_at,
      r.updated_at
    );
  }

  public async findBySupabaseSessionId(supabaseSessionId: string): Promise<SecuritySession | null> {
    const res = await this.dbPool
      .getPool()
      .query(
        'SELECT * FROM security_sessions WHERE supabase_session_id = $1 AND deleted_at IS NULL',
        [supabaseSessionId]
      );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new SecuritySession(
      r.id,
      r.user_id,
      r.supabase_session_id,
      r.browser,
      r.ip_address,
      r.country,
      r.device,
      r.user_agent,
      r.login_timestamp,
      r.revoked_by_admin,
      r.version,
      r.created_at,
      r.updated_at
    );
  }

  public async findActiveByUserId(userId: string): Promise<SecuritySession[]> {
    const res = await this.dbPool
      .getPool()
      .query(
        'SELECT * FROM security_sessions WHERE user_id = $1 AND revoked_by_admin = FALSE AND deleted_at IS NULL',
        [userId]
      );
    return res.rows.map(
      (r) =>
        new SecuritySession(
          r.id,
          r.user_id,
          r.supabase_session_id,
          r.browser,
          r.ip_address,
          r.country,
          r.device,
          r.user_agent,
          r.login_timestamp,
          r.revoked_by_admin,
          r.version,
          r.created_at,
          r.updated_at
        )
    );
  }

  public async save(session: SecuritySession): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO security_sessions (id, user_id, supabase_session_id, browser, ip_address, country, device, user_agent, login_timestamp, revoked_by_admin, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        revoked_by_admin = EXCLUDED.revoked_by_admin,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      session.id,
      session.userId,
      session.supabaseSessionId,
      session.browser,
      session.ipAddress,
      session.country,
      session.device,
      session.userAgent,
      session.loginTimestamp,
      session.revokedByAdmin,
      session.version,
    ]);
  }
}

export class PostgresAuthenticationMethodRepository implements AuthenticationMethodRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByUserId(userId: string): Promise<AuthenticationMethod[]> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM authentication_methods WHERE user_id = $1 AND deleted_at IS NULL', [
        userId,
      ]);
    return res.rows.map(
      (r) =>
        new AuthenticationMethod(
          r.id,
          r.user_id,
          r.method_type,
          r.is_enabled,
          r.preferences || {},
          r.version,
          r.created_at,
          r.updated_at
        )
    );
  }

  public async save(method: AuthenticationMethod): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO authentication_methods (id, user_id, method_type, is_enabled, preferences, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        is_enabled = EXCLUDED.is_enabled,
        preferences = EXCLUDED.preferences,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      method.id,
      method.userId,
      method.methodType,
      method.isEnabled,
      method.preferences,
      method.version,
    ]);
  }
}

export class PostgresTrustedDeviceRepository implements TrustedDeviceRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByUserId(userId: string): Promise<TrustedDevice[]> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM trusted_devices WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    return res.rows.map(
      (r) =>
        new TrustedDevice(
          r.id,
          r.user_id,
          new DeviceFingerprint(r.device_fingerprint),
          r.trust_expires_at,
          r.version,
          r.created_at,
          r.updated_at
        )
    );
  }

  public async save(device: TrustedDevice): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO trusted_devices (id, user_id, device_fingerprint, trust_expires_at, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        trust_expires_at = EXCLUDED.trust_expires_at,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      device.id,
      device.userId,
      device.deviceFingerprint.value,
      device.trustExpiresAt,
      device.version,
    ]);
  }
}

export class PostgresRoleRepository implements RoleRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<Role | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM roles WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new Role(r.id, r.name, r.description, r.version, r.created_at, r.updated_at);
  }

  public async findByName(name: string): Promise<Role | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM roles WHERE name = $1 AND deleted_at IS NULL', [name]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new Role(r.id, r.name, r.description, r.version, r.created_at, r.updated_at);
  }

  public async save(role: Role): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO roles (id, name, description, version, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [role.id, role.name, role.description, role.version]);
  }
}

export class PostgresPermissionGroupRepository implements PermissionGroupRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<PermissionGroup | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM permission_groups WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new PermissionGroup(r.id, r.name, r.description, r.version, r.created_at, r.updated_at);
  }

  public async findByName(name: string): Promise<PermissionGroup | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM permission_groups WHERE name = $1 AND deleted_at IS NULL', [name]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new PermissionGroup(r.id, r.name, r.description, r.version, r.created_at, r.updated_at);
  }

  public async save(group: PermissionGroup): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO permission_groups (id, name, description, version, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [group.id, group.name, group.description, group.version]);
  }

  public async savePermission(permission: Permission): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO permissions (id, permission_group_id, code, description, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        description = EXCLUDED.description,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      permission.id,
      permission.permissionGroupId,
      permission.code,
      permission.description,
      permission.version,
    ]);
  }

  public async assignGroupToRole(roleId: string, groupId: string): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO role_permission_groups (role_id, permission_group_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;
    await pool.query(query, [roleId, groupId]);
  }
}

export class PostgresUserRoleRepository implements UserRoleRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByUserId(userId: string): Promise<UserRole[]> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM user_roles WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    return res.rows.map(
      (r) => new UserRole(r.id, r.user_id, r.role_id, r.version, r.created_at, r.updated_at)
    );
  }

  public async save(userRole: UserRole): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO user_roles (id, user_id, role_id, version, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        role_id = EXCLUDED.role_id,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [userRole.id, userRole.userId, userRole.roleId, userRole.version]);
  }

  public async delete(userId: string, roleId: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      'UPDATE user_roles SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );
  }
}
