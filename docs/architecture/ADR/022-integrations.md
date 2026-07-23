# ADR-022: Integrations & Automation Platform

## Status

Accepted

## Context

Platform Administrators need to connect SMTP, Amazon Web Services buckets, OpenAI API, and payment pathways. Rather than separate standalones workspaces, these controls are platform modules within the ADMIN console workspace under `/admin/integrations/`.

## Decision

1. **Config-Driven Providers**: Establish standard configuration-driven metadata interfaces to define capabilities.
2. **Client-Side Secret Masking**: Hide client credentials (API keys, client secrets) immediately after validation.
3. **Trigger-Condition-Action**: Map automations tasks using visual triggers pipelines configurations.

## Consequences

- High security credentials masks.
- Integrated logging and webhook explorer histories.
