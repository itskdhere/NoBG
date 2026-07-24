-- CreateTable
CREATE TABLE "processed_image" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "resultUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "processed_image_userId_idx" ON "processed_image"("userId");

-- AddForeignKey
ALTER TABLE "processed_image" ADD CONSTRAINT "processed_image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
