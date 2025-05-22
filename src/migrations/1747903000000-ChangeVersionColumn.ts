import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeVersionColumn1747903000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing version column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "version"`);
        
        // Add version as a regular column
        await queryRunner.query(`ALTER TABLE "users" ADD "version" integer NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the regular version column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "version"`);
        
        // Add back the version column
        await queryRunner.query(`ALTER TABLE "users" ADD "version" integer NOT NULL DEFAULT 1`);
    }
} 