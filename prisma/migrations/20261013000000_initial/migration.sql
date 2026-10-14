-- CreateTable
CREATE TABLE `students` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` VARCHAR(50) NOT NULL,
    `fname` VARCHAR(100) NOT NULL,
    `mname` VARCHAR(100) NOT NULL DEFAULT '',
    `lname` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL DEFAULT '',
    `grade` VARCHAR(20) NOT NULL,
    `section` VARCHAR(50) NOT NULL,
    `academicyear` VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    `gender` VARCHAR(10) NOT NULL DEFAULT 'Male',
    `contact` VARCHAR(30) NOT NULL DEFAULT '',
    `parent_name` VARCHAR(150) NOT NULL DEFAULT '',
    `parent_contact` VARCHAR(30) NOT NULL DEFAULT '',
    `address` TEXT NULL,
    `image` LONGTEXT NULL,
    `track` VARCHAR(50) NOT NULL DEFAULT 'JHS',
    `strand` VARCHAR(100) NOT NULL DEFAULT 'JHS',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `students_student_id_key`(`student_id`),
    INDEX `students_grade_section_idx`(`grade`, `section`),
    INDEX `students_lname_fname_idx`(`lname`, `fname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `fname` VARCHAR(100) NOT NULL,
    `mname` VARCHAR(100) NOT NULL DEFAULT '',
    `lname` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
    `position` VARCHAR(100) NOT NULL DEFAULT 'Discipline Staff',
    `contact` VARCHAR(30) NOT NULL DEFAULT '',
    `image` LONGTEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `fname` VARCHAR(100) NOT NULL,
    `mname` VARCHAR(100) NOT NULL DEFAULT '',
    `lname` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `position` VARCHAR(100) NOT NULL DEFAULT 'Teacher I',
    `department` VARCHAR(100) NOT NULL DEFAULT 'Junior High School',
    `contact` VARCHAR(30) NOT NULL DEFAULT '',
    `gender` VARCHAR(10) NOT NULL DEFAULT 'Male',
    `image` LONGTEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `teachers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `advisers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `teacher_id` BIGINT UNSIGNED NOT NULL,
    `grade_level` VARCHAR(20) NOT NULL,
    `class_section` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `advisers_grade_level_class_section_key`(`grade_level`, `class_section`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `violations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(30) NOT NULL DEFAULT 'Minor',
    `severity` VARCHAR(30) NULL DEFAULT 'Minor',
    `default_sanction` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `violations_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `violation_id` BIGINT UNSIGNED NULL,
    `reported_by_id` BIGINT UNSIGNED NULL,
    `reported_by_type` VARCHAR(20) NULL DEFAULT 'admin',
    `reported_by_name` VARCHAR(150) NULL,
    `date_reported` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` VARCHAR(30) NOT NULL DEFAULT 'Pending',
    `approval_status` VARCHAR(30) NOT NULL DEFAULT 'Approved',
    `approved_by` VARCHAR(150) NULL,
    `approved_at` DATETIME(0) NULL,
    `rejected_by` VARCHAR(150) NULL,
    `rejected_at` DATETIME(0) NULL,
    `rejection_reason` TEXT NULL,
    `sanction` TEXT NULL,
    `remarks` TEXT NULL,
    `resolution_notes` TEXT NULL,
    `resolution_date` DATETIME(0) NULL,
    `sms_notified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `records_status_idx`(`status`),
    INDEX `records_approval_status_idx`(`approval_status`),
    INDEX `records_date_reported_idx`(`date_reported`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_locations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `latitude` DECIMAL(10, 7) NOT NULL,
    `longitude` DECIMAL(11, 7) NOT NULL,
    `accuracy_meters` INTEGER NOT NULL DEFAULT 10,
    `tracking_status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    `reported_by` VARCHAR(150) NOT NULL DEFAULT 'System',
    `recorded_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `student_locations_student_id_recorded_at_idx`(`student_id`, `recorded_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `date` DATE NOT NULL,
    `time` VARCHAR(100) NOT NULL DEFAULT '',
    `location` VARCHAR(200) NOT NULL DEFAULT '',
    `category` VARCHAR(50) NOT NULL DEFAULT 'academic',
    `categoryLabel` VARCHAR(100) NOT NULL DEFAULT 'Academic',
    `color` VARCHAR(20) NOT NULL DEFAULT '#07345f',
    `attendees` VARCHAR(200) NOT NULL DEFAULT 'All Students',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(150) NOT NULL,
    `user_role` VARCHAR(50) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `details` TEXT NULL,
    `audit_id` VARCHAR(80) NULL,
    `ip_address` VARCHAR(50) NULL,
    `device_info` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `activity_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meetings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `record_id` BIGINT UNSIGNED NULL,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `parent_name` VARCHAR(150) NOT NULL,
    `meeting_date` DATE NOT NULL,
    `meeting_time` TIME(0) NOT NULL,
    `venue` VARCHAR(150) NOT NULL DEFAULT 'Prefect of Discipline Office',
    `status` VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sms_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `record_id` BIGINT UNSIGNED NULL,
    `recipient_name` VARCHAR(150) NULL,
    `phone_number` VARCHAR(30) NOT NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Sent',
    `sent_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(30) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `sessions_token_hash_key`(`token_hash`),
    INDEX `sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `advisers` ADD CONSTRAINT `advisers_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `records` ADD CONSTRAINT `records_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `records` ADD CONSTRAINT `records_violation_id_fkey` FOREIGN KEY (`violation_id`) REFERENCES `violations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_locations` ADD CONSTRAINT `student_locations_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sms_logs` ADD CONSTRAINT `sms_logs_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sms_logs` ADD CONSTRAINT `sms_logs_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `records`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
