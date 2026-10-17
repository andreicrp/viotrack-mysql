-- MySQL 8.0.16+ or MariaDB 10.2.1+ is required for enforced CHECK constraints.
-- Run with the VioTrack database selected. Safe to re-run.

ALTER TABLE `records`
  MODIFY COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'Pending';

SET @records_status_check_exists = (
  SELECT COUNT(*)
  FROM information_schema.table_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'records'
    AND constraint_name = 'records_status_check'
    AND constraint_type = 'CHECK'
);

SET @drop_records_status_check = IF(
  @records_status_check_exists > 0,
  'ALTER TABLE `records` DROP CONSTRAINT `records_status_check`',
  'SELECT 1'
);

PREPARE drop_records_status_check_stmt FROM @drop_records_status_check;
EXECUTE drop_records_status_check_stmt;
DEALLOCATE PREPARE drop_records_status_check_stmt;

ALTER TABLE `records`
  ADD CONSTRAINT `records_status_check`
  CHECK (
    `status` IN (
      'Pending',
      'Investigation',
      'Resolved',
      'Dismissed',
      'Under Approval',
      'Rejected',
      'Escalated',
      '1st Conference',
      '2nd Conference',
      '3rd Conference'
    )
  );