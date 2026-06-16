import { describe, it, expect } from 'vitest';
import { Neo4jGraphStore } from '../src/neo4jGraph.js';

describe('Neo4jGraphStore', () => {
  it('can be constructed', () => {
    const store = new Neo4jGraphStore('bolt://localhost:7687', 'neo4j', 'password');
    expect(store).toBeDefined();
  });

  it('has static isNull property', () => {
    expect(Neo4jGraphStore.isNull).toBe(false);
  });

  it('exports the class', () => {
    expect(Neo4jGraphStore).toBeDefined();
  });
});
