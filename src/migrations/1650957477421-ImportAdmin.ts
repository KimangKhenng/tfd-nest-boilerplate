import { MigrationInterface, QueryRunner } from 'typeorm';

import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const readSqlFile = (filepath: string): string[] => {
  return fs
    .readFileSync(path.join(__dirname, filepath))
    .toString()
    .replace(/\r?\n|\r/g, '')
    .split(';')
    .filter((query) => query?.length);
};
export class ImportAdmin1650957477421 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const queries = readSqlFile('./../sql/admin.sql');
    for (let i = 0; i < queries.length; i++) {
      await queryRunner.query(queries[i]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
