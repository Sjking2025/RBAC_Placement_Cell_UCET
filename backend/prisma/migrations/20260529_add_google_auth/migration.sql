-- AlterTable: Make password_hash optional, add google_id and auth_provider
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "google_id" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN "auth_provider" VARCHAR(20) NOT NULL DEFAULT 'email';
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
