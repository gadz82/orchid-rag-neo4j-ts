# @orchid-ai/orchid-rag-neo4j

Neo4j graph-store backend plugin for the [Orchid AI](https://github.com/gadz82/orchid) framework — TypeScript port of `orchid-rag-neo4j`.

## What it provides

- `Neo4jGraphStore` — implements `OrchidGraphStore` backed by Neo4j

## Installation

```bash
npm install @orchid-ai/orchid-rag-neo4j
```

## Usage

Reference `graph_store_backend: neo4j` in your `agents.yaml`:

```yaml
rag:
  graph_store_backend: neo4j
  neo4j_url: neo4j://localhost:7687
  neo4j_username: neo4j
  neo4j_password: secret
```

Or build it programmatically:

```ts
import { Neo4jGraphStore } from "@orchid-ai/orchid-rag-neo4j";

const store = new Neo4jGraphStore({
  url: "neo4j://localhost:7687",
  username: "neo4j",
  password: "secret",
});
```

## Auto-registration

The package registers itself via the `orchid` key in `package.json`:

```json
{
  "orchid": {
    "graphStores": "./dist/index.js"
  }
}
```

No manual `registerGraphStore()` calls are needed by integrators.

## Development

```bash
cd orchid-rag-neo4j-ts
npm install
npm test
npm run lint
npm run typecheck
```

Tests mock `neo4j-driver` — no live Neo4j required.

## License

MIT
