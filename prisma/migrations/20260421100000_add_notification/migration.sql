-- Drop foreign keys on Registration before altering primary key
ALTER TABLE `Registration` DROP FOREIGN KEY `Registration_teacherId_fkey`;
ALTER TABLE `Registration` DROP FOREIGN KEY `Registration_studentId_fkey`;

-- AlterTable: drop composite PK, add id column
ALTER TABLE `Registration` DROP PRIMARY KEY,
    ADD COLUMN `id` VARCHAR(191) NOT NULL DEFAULT '';

-- Backfill id for any existing rows
UPDATE `Registration` SET `id` = UUID() WHERE `id` = '';

-- Set id as primary key and add unique constraint
ALTER TABLE `Registration` MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`),
    ADD UNIQUE INDEX `Registration_teacherId_studentId_key`(`teacherId`, `studentId`);

-- Re-add foreign keys
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationRecipient` (
    `id` VARCHAR(191) NOT NULL,
    `notificationId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `NotificationRecipient_notificationId_studentId_key`(`notificationId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationRecipient` ADD CONSTRAINT `NotificationRecipient_notificationId_fkey` FOREIGN KEY (`notificationId`) REFERENCES `Notification`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationRecipient` ADD CONSTRAINT `NotificationRecipient_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
