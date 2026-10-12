#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0680811b8148fc4d84baaec2390755da26645af7c4cdb2e0f7dd07702e8316de/contract';
import startContract from '../../snapshots/0680811b8148fc4d84baaec2390755da26645af7c4cdb2e0f7dd07702e8316de/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a36f26a1473d432de17450bdda7c413292d8c254edba65cb137dbf842b5e3b28/contract';
import endContract from '../../snapshots/a36f26a1473d432de17450bdda7c413292d8c254edba65cb137dbf842b5e3b28/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Membership',
        column: col('membershipId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Membership',
        column: col('membershipType', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
