-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
-- RedefineTables
PRAGMA foreign_keys = OFF;
CREATE TABLE "new_Link" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE
    SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Link" ("createdAt", "description", "id", "url")
SELECT "createdAt",
    "description",
    "id",
    "url"
FROM "Link";
DROP TABLE "Link";
ALTER TABLE "new_Link"
    RENAME TO "Link";
PRAGMA foreign_key_check;
PRAGMA foreign_keys = ON;
-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");