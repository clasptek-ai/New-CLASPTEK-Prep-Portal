# Enterprise Research Export Lifecycle Guide

## Lifecycle States

1. `REQUESTED`: Export job initiated by authenticated researcher.
2. `VALIDATING`: System validates dataset query bounds and schema filters.
3. `ANONYMIZING`: Student identifiers scrubbed using SHA-256 pseudonymization.
4. `AGGREGATING`: Data aggregated into CSV/Parquet research chunks.
5. `READY`: Secure download URL generated (expires in 24 hours).
6. `FAILED`: Terminal error logged to DLQ with audit trace.
