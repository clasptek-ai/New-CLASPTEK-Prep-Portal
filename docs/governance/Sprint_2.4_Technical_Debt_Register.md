# Sprint 2.4 — Technical Debt Register

This register tracks deferred modifications and areas identified for optimization.

| Debt ID     | Classification  | Description                                                                                                                              | Impact | Target Remediation              |
| ----------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------- |
| **TD-Q001** | Test Coverage   | Mock DB is utilized in API integration tests; full live integration environment tests could cover deeper PG transaction boundary states. | Medium | Sprint 2.6 Integration Phase    |
| **TD-Q002** | Schema Registry | Dynamic schema validator currently uses basic key-presence checking; should integrate full AJV JSON schema validators.                   | Low    | Sprint 2.5 Refinement           |
| **TD-Q003** | Import Pipeline | Import repository uses mock pipeline handlers; needs fully mapped backend ingestion service linking.                                     | High   | Sprint 2.5 Pipeline Integration |
