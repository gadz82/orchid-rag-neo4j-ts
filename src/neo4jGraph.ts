// Neo4j graph store
import neo4j, { type Driver } from 'neo4j-driver';
import type { OrchidEntity, OrchidEdge, OrchidRAGScope } from '@orchid-ai/orchid/core';

export class Neo4jGraphStore {
  static isNull = false;
  private driver: Driver;

  constructor(url: string, username: string, password: string) {
    this.driver = neo4j.driver(url, neo4j.auth.basic(username, password));
  }

  async upsertEntities(entities: OrchidEntity[], scope: OrchidRAGScope): Promise<void> {
    const session = this.driver.session();
    try {
      for (const entity of entities) {
        await session.run(
          `MERGE (e:Entity {id: $id})
           SET e.name = $name, e.type = $type, e.tenant_id = $tenantId,
               e.user_id = $userId, e.chat_id = $chatId, e.agent_id = $agentId
           SET e += $properties`,
          {
            id: entity.id,
            name: entity.name,
            type: entity.type || 'Entity',
            tenantId: scope.tenantId,
            userId: scope.userId,
            chatId: scope.chatId,
            agentId: scope.agentId,
            properties: entity.properties || {},
          },
        );
      }
    } finally {
      await session.close();
    }
  }

  async upsertEdges(edges: OrchidEdge[], scope: OrchidRAGScope): Promise<void> {
    const session = this.driver.session();
    try {
      for (const edge of edges) {
        await session.run(
          `MATCH (a:Entity {id: $sourceId}), (b:Entity {id: $targetId}) WHERE a.tenant_id = $tenantId MERGE (a)-[r:RELATES {type: $relation}]->(b) SET r += $properties`,
          {
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            relation: edge.relation || 'RELATES',
            tenantId: scope.tenantId,
            properties: edge.properties || {},
          },
        );
      }
    } finally {
      await session.close();
    }
  }

  async findEntities(_query: string, scope: OrchidRAGScope, typeFilter?: string, k = 10): Promise<OrchidEntity[]> {
    const session = this.driver.session();
    try {
      let cypher = `MATCH (e:Entity) WHERE e.tenant_id = $tenantId`;
      if (scope.userId) cypher += ' AND e.user_id = $userId';
      if (scope.chatId) cypher += ' AND e.chat_id = $chatId';
      if (typeFilter) cypher += ' AND e.type = $typeFilter';
      cypher += ` RETURN e LIMIT $k`;

      const result = await session.run(cypher, {
        tenantId: scope.tenantId,
        userId: scope.userId,
        chatId: scope.chatId,
        typeFilter,
        k,
      });
      return result.records.map((record) => {
        const node = record.get('e');
        return {
          id: node.properties.id,
          name: node.properties.name,
          type: node.properties.type,
          properties: node.properties,
        };
      });
    } finally {
      await session.close();
    }
  }

  async neighbours(
    entityIds: string[],
    scope: OrchidRAGScope,
    maxHops = 1,
    relationFilter?: string,
  ): Promise<{ entities: OrchidEntity[]; edges: OrchidEdge[] }> {
    const session = this.driver.session();
    try {
      const relClause = relationFilter ? `[r:RELATES {type: "${relationFilter}"}]` : `[r:RELATES]`;
      const result = await session.run(
        `MATCH (e:Entity)-${relClause}*1..${maxHops}-(n:Entity) WHERE e.id IN $entityIds AND e.tenant_id = $tenantId RETURN e, r, n LIMIT 100`,
        { entityIds, tenantId: scope.tenantId },
      );
      const entities: OrchidEntity[] = [];
      const edges: OrchidEdge[] = [];
      const seen = new Set<string>();
      for (const record of result.records) {
        const eNode = record.get('e');
        const nNode = record.get('n');
        if (eNode && !seen.has(eNode.properties.id)) {
          seen.add(eNode.properties.id);
          entities.push({
            id: eNode.properties.id,
            name: eNode.properties.name,
            type: eNode.properties.type,
            properties: eNode.properties,
          });
        }
        if (nNode && !seen.has(nNode.properties.id)) {
          seen.add(nNode.properties.id);
          entities.push({
            id: nNode.properties.id,
            name: nNode.properties.name,
            type: nNode.properties.type,
            properties: nNode.properties,
          });
        }
        const rels = record.get('r') as
          | Array<{ properties: Record<string, unknown>; type: string }>
          | { properties: Record<string, unknown>; type: string };
        if (Array.isArray(rels)) {
          for (const rel of rels) {
            edges.push({
              sourceId: eNode?.properties.id || '',
              targetId: nNode?.properties.id || '',
              relation: rel.type || 'RELATES',
              properties: rel.properties || {},
            });
          }
        }
      }
      return { entities, edges };
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}
