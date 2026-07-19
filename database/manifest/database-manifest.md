# Database Manifest: Platform Foundation

This manifest acts as the central directory mapping the PostgreSQL schemas, relationships, RLS policies, extensions, and seeding configurations.

---

## 1. Active Extensions

- `pgcrypto`: Governs secure password hashing, generation of keys, and cryptography helpers.
- `pg_stat_statements`: Gathers performance and query metrics.
- `pg_trgm`: Supports trigram searches and similarity matches.

---

## 2. Relational Tables Layout

### Core Infrastructure

- `migrations_log`: Logs applied migration checksum files and timestamps.
- `platform_metadata`: Holds localized configuration attributes and environment flags.

### Identity Domain

- `users`: Authoritative user account aggregate root entries.
- `identities`: Linked authentication channels (local password, oauth social channels).
- `profiles`: Personal metadata details (locale, timezone, names).

### Authorization Domain

- `roles`: Security roles hierarchy configuration.
- `permission_groups`: Logically maps privileges capabilities.
- `permissions`: Security check codes.
- `role_permission_groups`: Junction table mapping capability groups to roles.
- `user_roles`: Maps active users to role classifications.

### Security Domain

- `security_profiles`: Manages account state counters and lock conditions.
- `security_sessions`: Active cookie logging and tracking details.
- `trusted_devices`: Browser trust metadata registry.

### Exam Product Domain

- `exam_products`: Bounded context root aggregate tracking codes, slugs, families, and versions.
- `exam_product_versions`: Semantic versioned product configurations, effective dates, and statuses.
- `official_exam_structures`: Exam structures mapping official component hierarchies.
- `official_exam_components`: Hierarchical exam sections, modules, parts, papers, and tasks.
- `exam_delivery_configurations`: Tracks linear, adaptive, proctored settings.
- `exam_regional_variants`: Localization overrides, regional local board authorities, and currencies.
- `exam_board_metadata`: Extensible metadata specific to the official board definitions.
- `clasptek_product_metadata`: Clasptek-specific business metadata extensions.

---

## 3. Row Level Security (RLS) Enforcements

| Schema Table                  | Policy Name                               | Allowed Commands | Target Context         |
| ----------------------------- | ----------------------------------------- | ---------------- | ---------------------- |
| `users`                       | `select_own_user`                         | `SELECT`         | `id = auth.uid()`      |
| `users`                       | `update_own_user`                         | `UPDATE`         | `id = auth.uid()`      |
| `identities`                  | `select_own_identity`                     | `SELECT`         | `user_id = auth.uid()` |
| `identities`                  | `update_own_identity`                     | `UPDATE`         | `user_id = auth.uid()` |
| `profiles`                    | `select_own_profile`                      | `SELECT`         | `user_id = auth.uid()` |
| `profiles`                    | `update_own_profile`                      | `UPDATE`         | `user_id = auth.uid()` |
| `security_profiles`           | `select_own_profile`                      | `SELECT`         | `user_id = auth.uid()` |
| `security_sessions`           | `select_own_session`                      | `SELECT`         | `user_id = auth.uid()` |
| `trusted_devices`             | `select_own_device`                       | `SELECT`         | `user_id = auth.uid()` |
| `user_roles`                  | `select_own_roles`                        | `SELECT`         | `user_id = auth.uid()` |
| `exam_products`               | `select_public_exam_products`             | `SELECT`         | `status = 'PUBLISHED'` |
| `exam_product_versions`       | `select_public_exam_product_versions`     | `SELECT`         | `status = 'PUBLISHED'` |
| `official_exam_structures`    | `select_public_official_exam_structures`  | `SELECT`         | `status = 'ACTIVE'`    |
| `official_exam_components`    | `select_public_official_exam_components`  | `SELECT`         | `status = 'ACTIVE'`    |
| `exam_delivery_configurations`| `select_public_exam_delivery_config`      | `SELECT`         | `status = 'ACTIVE'`    |
| `exam_regional_variants`      | `select_public_exam_regional_variants`    | `SELECT`         | `status = 'ACTIVE'`    |
| `exam_board_metadata`         | `select_public_exam_board_metadata`       | `SELECT`         | `true`                 |
| `clasptek_product_metadata`   | `select_public_clasptek_product_metadata` | `SELECT`         | `true`                 |

> **Service Role Strategy**: The administrative service client (`service_role`) bypasses all RLS checks automatically, enabling server-side background orchestration.

---

## 4. Seeding Configuration

Idempotent seed stages are structured as:

- `00001_roles.sql`: Standard roles setup.
- `00002_permission_groups.sql`: Privileges catalog setup.
- `00003_permissions.sql`: Permissions rules.
- `00004_feature_flags.sql`: Beta and Production feature flags.
- `00005_platform_settings.sql`: Timezones, locales, and platform variables.
- `00006_reference_metadata.sql`: ISO languages, countries, and timezone lookups.
- `00101_exam_product_seed.sql`: Seed data for Digital SAT, IELTS Academic/General catalogs.
