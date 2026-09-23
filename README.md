# @cosmic-arcana/sdk

Shared contracts between Cosmic Arcana services. No framework dependencies, no runtime
dependencies.

- `SpreadCreatedV1` + `parseSpreadCreatedEnvelope` — the `spread.created` domain event and its
  broker envelope. Versioned from day one; parsing rejects anything else.
- `SpreadDetailsV1` — tarot-service-api's spread resource, re-queried by projections.
- `SpreadHistoryPageV1` — history-service-api's page response.
- `SPREAD_CREATED_EVENT`, `SPREAD_CREATED_QUEUE` — the names producer and consumer must agree on.

Every parser throws `ContractViolationError` and strips unknown fields, so a message from the
broker is data, never trusted input.

```bash
npm install
npm run build     # services depend on dist/ through file:../cosmic-arcana-sdk
npm test
```
