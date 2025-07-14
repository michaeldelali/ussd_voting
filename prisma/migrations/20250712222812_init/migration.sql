-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "voter_phone" VARCHAR(15) NOT NULL,
    "number_of_votes" INTEGER NOT NULL,
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "transaction_id" VARCHAR(255) NOT NULL,
    "transaction_status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "transaction_message" TEXT,
    "session_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" SERIAL NOT NULL,
    "donor_phone" VARCHAR(15) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "transaction_id" VARCHAR(255) NOT NULL,
    "transaction_status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "transaction_message" TEXT,
    "session_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ussd_sessions" (
    "session_id" VARCHAR(255) NOT NULL,
    "msisdn" VARCHAR(15) NOT NULL,
    "menu_state" VARCHAR(50) NOT NULL,
    "prev_menu_state" VARCHAR(50),
    "transaction_data" JSONB,
    "user_id" VARCHAR(255),
    "network" VARCHAR(50),
    "msg_type" VARCHAR(50),
    "user_data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ussd_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_code_key" ON "candidates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "votes_transaction_id_key" ON "votes"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "donations_transaction_id_key" ON "donations"("transaction_id");

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
