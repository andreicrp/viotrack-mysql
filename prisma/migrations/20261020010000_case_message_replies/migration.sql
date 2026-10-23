ALTER TABLE `case_messages`
  ADD COLUMN `reply_to_id` BIGINT UNSIGNED NULL,
  ADD INDEX `case_messages_reply_to_id_idx` (`reply_to_id`),
  ADD CONSTRAINT `case_messages_reply_to_id_fkey`
    FOREIGN KEY (`reply_to_id`) REFERENCES `case_messages` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
