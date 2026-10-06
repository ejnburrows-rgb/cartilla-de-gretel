# Cartilla GitHub → Miro live sync

This service mirrors current GitHub project state into the existing **La Cartilla de Gretel — Project Map** Miro board.

- GitHub is authoritative.
- `push` to `main`, pull-request changes, and issue changes trigger immediate synchronization.
- `/api/reconcile` runs every 15 minutes as a full safety reconciliation.
- GitHub delivery IDs are kept in an integration-owned sync-state App Card for idempotency.
- Source records use stable integration keys, so reconciliation updates rather than duplicates.
- Existing integration cards are updated without position/parent fields, preserving manual Miro layout.
- Removed/superseded source records are disabled, not deleted.
- The service has no Miro webhook and no Miro→GitHub write path.
