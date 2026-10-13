#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/125795c6be269c11489c4c6de406fabcc681c445f4c03d34f4c5efef6b11dc1c/contract';
import endContract from '../../snapshots/125795c6be269c11489c4c6de406fabcc681c445f4c03d34f4c5efef6b11dc1c/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/a36f26a1473d432de17450bdda7c413292d8c254edba65cb137dbf842b5e3b28/contract';
import startContract from '../../snapshots/a36f26a1473d432de17450bdda7c413292d8c254edba65cb137dbf842b5e3b28/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'CVVersion',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('cvId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('data', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('version', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'CVVersion',
        index: 'CVVersion_cvId_idx',
        columns: ['cvId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'CVVersion',
        index: 'CVVersion_cvId_version_key',
        columns: ['cvId', 'version'],
        extras: { unique: true },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'CVVersion',
        foreignKey: {
          name: 'CVVersion_cvId_fkey',
          columns: ['cvId'],
          references: { schema: 'public', table: 'CV', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
