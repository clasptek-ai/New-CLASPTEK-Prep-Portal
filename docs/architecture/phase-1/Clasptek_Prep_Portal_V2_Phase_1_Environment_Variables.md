# Clasptek Prep Portal V2 — Phase 1 Configuration Categories

This file defines categories and naming patterns, not production secret values.

## Public browser-safe configuration

- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RELEASE_VERSION`
- approved public observability identifier, where applicable

## Server configuration

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_COOKIE_DOMAIN`
- `AUTH_SESSION_IDLE_TIMEOUT`
- `AUTH_SESSION_ABSOLUTE_TIMEOUT`
- `AUTH_REMEMBER_ME_TIMEOUT`
- `ALLOWED_ORIGINS`
- `RATE_LIMIT_PROVIDER`
- `STORAGE_BUCKET_PRIVATE`
- `QUEUE_PROVIDER`
- `EMAIL_PROVIDER`
- `SMS_PROVIDER`
- `PUSH_PROVIDER`
- `OTEL_EXPORTER_ENDPOINT`
- `ERROR_MONITORING_DSN`
- `RELEASE_VERSION`

## Secrets

Secrets must be supplied by the approved secret manager. They must not be committed, written to logs or exposed through diagnostics.

Examples:

- provider API credentials
- deployment credentials
- database privileged credentials
- webhook signing secrets
- virus-scanner credentials
- telemetry authentication tokens

## Validation rules

- Production must fail startup when critical values are missing.
- Unknown configuration keys should be reported.
- Public keys must be allow-listed explicitly.
- Environment names are restricted to approved values.
- URL, duration, integer and enum types are validated.
- Secret values are redacted from errors.
