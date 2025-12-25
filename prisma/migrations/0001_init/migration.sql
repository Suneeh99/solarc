/* ------------------------------------------------------------------ */
/* Enums                                                              */
/* ------------------------------------------------------------------ */

CREATE TYPE "UserRole" AS ENUM ('customer', 'installer', 'officer');

CREATE TYPE "ApplicationStatus" AS ENUM (
  'pending',
  'under_review',
  'site_visit_scheduled',
  'approved',
  'rejected',
  'payment_pending',
  'payment_confirmed',
  'finding_installer',
  'installation_in_progress',
  'installation_complete',
  'final_inspection',
  'agreement_pending',
  'completed'
);

CREATE TYPE "BidStatus" AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE "BidSessionStatus" AS ENUM ('open', 'closed', 'expired');
CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE "InvoiceType" AS ENUM ('authority_fee', 'installation', 'monthly_bill');


/* ------------------------------------------------------------------ */
/* Core Tables                                                        */
/* ------------------------------------------------------------------ */

CREATE TABLE "Organization" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "registrationNumber" TEXT,
  "description" TEXT,
  "address" TEXT,
  "phone" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" TIMESTAMP(3),
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "completedInstallations" INTEGER NOT NULL DEFAULT 0,
  "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "organizationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");


/* ------------------------------------------------------------------ */
/* Installer Packages                                                 */
/* ------------------------------------------------------------------ */

CREATE TABLE "InstallerPackage" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "capacity" TEXT NOT NULL,
  "panelCount" INTEGER NOT NULL,
  "panelType" TEXT NOT NULL,
  "inverterBrand" TEXT NOT NULL,
  "warranty" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "features" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);


/* ------------------------------------------------------------------ */
/* Applications                                                       */
/* ------------------------------------------------------------------ */

CREATE TABLE "Application" (
  "id" TEXT PRIMARY KEY,
  "reference" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "installerOrganizationId" TEXT,
  "selectedPackageId" TEXT,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
  "siteVisitDate" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "documents" JSONB NOT NULL,
  "technicalDetails" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "Application_reference_key" ON "Application"("reference");


/* ------------------------------------------------------------------ */
/* Bidding                                                            */
/* ------------------------------------------------------------------ */

CREATE TABLE "BidSession" (
  "id" TEXT PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "status" "BidSessionStatus" NOT NULL DEFAULT 'open',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Bid" (
  "id" TEXT PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "bidSessionId" TEXT,
  "installerId" TEXT,
  "organizationId" TEXT,
  "packageId" TEXT,
  "price" INTEGER NOT NULL,
  "proposal" TEXT NOT NULL,
  "warranty" TEXT NOT NULL,
  "estimatedDays" INTEGER NOT NULL,
  "status" "BidStatus" NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);


/* ------------------------------------------------------------------ */
/* Billing                                                            */
/* ------------------------------------------------------------------ */

CREATE TABLE "Invoice" (
  "id" TEXT PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
  "type" "InvoiceType" NOT NULL,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "MeterReading" (
  "id" TEXT PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "kwhGenerated" DOUBLE PRECISION NOT NULL,
  "kwhExported" DOUBLE PRECISION NOT NULL,
  "kwhImported" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);


/* ------------------------------------------------------------------ */
/* Notifications & Sessions                                           */
/* ------------------------------------------------------------------ */

CREATE TABLE "Notification" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY,
  "token" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");


/* ------------------------------------------------------------------ */
/* Foreign Keys                                                       */
/* ------------------------------------------------------------------ */

ALTER TABLE "User"
  ADD CONSTRAINT "User_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InstallerPackage"
  ADD CONSTRAINT "InstallerPackage_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Application"
  ADD CONSTRAINT "Application_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Application"
  ADD CONSTRAINT "Application_installerOrganizationId_fkey"
  FOREIGN KEY ("installerOrganizationId") REFERENCES "Organization"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Application"
  ADD CONSTRAINT "Application_selectedPackageId_fkey"
  FOREIGN KEY ("selectedPackageId") REFERENCES "InstallerPackage"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BidSession"
  ADD CONSTRAINT "BidSession_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BidSession"
  ADD CONSTRAINT "BidSession_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Bid"
  ADD CONSTRAINT "Bid_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Bid"
  ADD CONSTRAINT "Bid_bidSessionId_fkey"
  FOREIGN KEY ("bidSessionId") REFERENCES "BidSession"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Bid"
  ADD CONSTRAINT "Bid_installerId_fkey"
  FOREIGN KEY ("installerId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Bid"
  ADD CONSTRAINT "Bid_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Bid"
  ADD CONSTRAINT "Bid_packageId_fkey"
  FOREIGN KEY ("packageId") REFERENCES "InstallerPackage"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Invoice"
  ADD CONSTRAINT "Invoice_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invoice"
  ADD CONSTRAINT "Invoice_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MeterReading"
  ADD CONSTRAINT "MeterReading_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MeterReading"
  ADD CONSTRAINT "MeterReading_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Session"
  ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
