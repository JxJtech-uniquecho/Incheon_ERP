ALTER TYPE "ErpRole" RENAME TO "ErpRole_old";
CREATE TYPE "ErpRole" AS ENUM ('master', 'submaster', 'user');
CREATE TYPE "AccountStatus" AS ENUM ('pending', 'approved', 'rejected', 'inactive', 'blocked');

ALTER TABLE "AuditLog" ALTER COLUMN "actorRole" TYPE "ErpRole" USING (
  CASE "actorRole"::text
    WHEN 'SUPER_ADMIN' THEN 'master'
    WHEN 'OFFICE_ADMIN' THEN 'submaster'
    WHEN 'EXECUTIVE' THEN 'submaster'
    WHEN 'BRANCH_MANAGER' THEN 'submaster'
    ELSE 'user'
  END
)::"ErpRole";

ALTER TABLE "User" ADD COLUMN "loginId" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "branchId" TEXT;
ALTER TABLE "User" ADD COLUMN "requestedRole" "ErpRole" NOT NULL DEFAULT 'user';
ALTER TABLE "User" ADD COLUMN "accountStatus" "AccountStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "User" ADD COLUMN "positionTitle" TEXT;
ALTER TABLE "User" ADD COLUMN "organizationName" TEXT;
ALTER TABLE "User" ADD COLUMN "requestReason" TEXT;
ALTER TABLE "User" ADD COLUMN "privacyConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "approvedById" TEXT;
ALTER TABLE "User" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "rejectedReason" TEXT;
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "lastActivityAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "failedLoginCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lockedUntil" TIMESTAMP(3);

UPDATE "User"
SET "loginId" = COALESCE(NULLIF(split_part("email", '@', 1), ''), 'user_' || substr("id", 1, 8)),
    "requestedRole" = (
      CASE "role"::text
        WHEN 'SUPER_ADMIN' THEN 'master'
        WHEN 'OFFICE_ADMIN' THEN 'submaster'
        WHEN 'EXECUTIVE' THEN 'submaster'
        WHEN 'BRANCH_MANAGER' THEN 'submaster'
        ELSE 'user'
      END
    )::"ErpRole",
    "accountStatus" = (
      CASE "status"::text
        WHEN 'ACTIVE' THEN 'approved'
        WHEN 'LOCKED' THEN 'blocked'
        ELSE 'inactive'
      END
    )::"AccountStatus",
    "privacyConsent" = true;

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "ErpRole" USING (
  CASE "role"::text
    WHEN 'SUPER_ADMIN' THEN 'master'
    WHEN 'OFFICE_ADMIN' THEN 'submaster'
    WHEN 'EXECUTIVE' THEN 'submaster'
    WHEN 'BRANCH_MANAGER' THEN 'submaster'
    ELSE 'user'
  END
)::"ErpRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';

UPDATE "User"
SET "loginId" = 'admin',
    "role" = 'master',
    "requestedRole" = 'master',
    "accountStatus" = 'approved'
WHERE "email" = 'admin@inpharmy.local';

ALTER TABLE "User" ALTER COLUMN "loginId" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN "status";
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP TYPE "UserStatus";
DROP TYPE "ErpRole_old";
