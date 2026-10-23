CREATE TABLE `case_threads` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `record_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` DATETIME(0) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `case_threads_record_id_key` (`record_id`),
  CONSTRAINT `case_threads_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `case_messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `thread_id` BIGINT UNSIGNED NOT NULL,
  `author_id` BIGINT UNSIGNED NOT NULL,
  `author_role` VARCHAR(20) NOT NULL,
  `author_name` VARCHAR(150) NOT NULL,
  `author_position` VARCHAR(100) NOT NULL,
  `body` TEXT NULL,
  `attachment_url` LONGTEXT NULL,
  `attachment_name` VARCHAR(255) NULL,
  `audio_url` LONGTEXT NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  INDEX `case_messages_thread_id_created_at_idx` (`thread_id`, `created_at`),
  CONSTRAINT `case_messages_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `case_threads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `case_threads` (`record_id`, `created_at`, `updated_at`)
SELECT `id`, CURRENT_TIMESTAMP(0), CURRENT_TIMESTAMP(0)
FROM `records`
WHERE `approval_status` = 'Approved';
