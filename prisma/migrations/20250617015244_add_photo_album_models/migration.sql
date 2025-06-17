-- CreateTable
CREATE TABLE "photo_albums" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "creator_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "photo_albums_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "description" TEXT,
    "location" TEXT,
    "camera" TEXT,
    "lens" TEXT,
    "settings" TEXT,
    "tags" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "media_id" TEXT NOT NULL,
    "album_id" TEXT,
    "taken_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "photos_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "photos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "photo_albums" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "photo_id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_photos_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_photos_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_albums_slug_key" ON "photo_albums"("slug");

-- CreateIndex
CREATE INDEX "photo_albums_slug_idx" ON "photo_albums"("slug");

-- CreateIndex
CREATE INDEX "photo_albums_creator_id_idx" ON "photo_albums"("creator_id");

-- CreateIndex
CREATE INDEX "photo_albums_isPublished_idx" ON "photo_albums"("isPublished");

-- CreateIndex
CREATE INDEX "photos_album_id_idx" ON "photos"("album_id");

-- CreateIndex
CREATE INDEX "photos_isFeatured_idx" ON "photos"("isFeatured");

-- CreateIndex
CREATE INDEX "photos_taken_at_idx" ON "photos"("taken_at");

-- CreateIndex
CREATE INDEX "post_photos_post_id_idx" ON "post_photos"("post_id");

-- CreateIndex
CREATE INDEX "post_photos_photo_id_idx" ON "post_photos"("photo_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_photos_post_id_photo_id_key" ON "post_photos"("post_id", "photo_id");
