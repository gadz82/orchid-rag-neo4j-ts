# orchid-rag-neo4j-ts — AI Context

## What This Package Is

**`@orchid-ai/orchid-rag-neo4j`** is the Neo4j graph-store backend plugin for the Orchid multi-agent AI framework — the
TypeScript port of the Python `orchid-rag-neo4j` package. It provides `Neo4jGraphStore` implementing
`OrchidGraphStore` — entity/edge CRUD + neighbour traversal via Cypher. It imports `@orchid-ai/orchid` as a workspace
dependency.

## Package Structure

```
orchid-rag-neo4j-ts/
  src/
    index.ts
    neo4jGraph.ts
  tests/
  package.json
```

## Architecture Rules

1. **This is a plugin package.** It implements ABCs defined in `@orchid-ai/orchid/core`.
2. **Auto-registration via package.json `orchid` key.**
3. **Dependencies:** Only `@orchid-ai/orchid` (workspace) and `neo4j-driver`.
4. **Tests mock `neo4j-driver`.** Neo4j service container available for optional integration tests in CI.
5. **No vendor-specific code in comments.**

## Python Reference

This is a 1:1 port of `orchid-rag-neo4j/`. The authoritative reference is:

- `orchid-workspace/orchid-rag-neo4j/` — read source files there

## Key Patterns

### Registration

```ts
// src/index.ts
import { registerGraphStore } from '@orchid-ai/orchid/rag';
import { Neo4jGraphStore } from './neo4jGraph.js';

export { Neo4jGraphStore };

export function register() {
  registerGraphStore('neo4j', (settings) => new Neo4jGraphStore(settings));
}
```

```json
// package.json
{
  "orchid": {
    "graphStores": "./dist/index.js"
  }
}
```

## Implements

| ABC                | Implementation    | Purpose                                           |
|--------------------|-------------------|---------------------------------------------------|
| `OrchidGraphStore` | `Neo4jGraphStore` | Entity/edge CRUD + neighbour traversal via Cypher |

## Testing

```bash
cd orchid-rag-neo4j-ts
npm install
npm test
npm run lint
npm run typecheck
```
