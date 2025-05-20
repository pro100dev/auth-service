import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1747675403149 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."users_provider_enum" AS ENUM('google');
            
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying,
                "nickname" character varying NOT NULL,
                "avatarUrl" character varying,
                "provider" "public"."users_provider_enum" NOT NULL DEFAULT 'google',
                "providerId" character varying,
                "refreshToken" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "version" integer NOT NULL DEFAULT 1,
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "users";
            DROP TYPE "public"."users_provider_enum";
        `);
    }

}
