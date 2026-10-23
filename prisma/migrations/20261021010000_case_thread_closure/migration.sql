ALTER TABLE `case_threads`
  ADD COLUMN `is_closed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `closed_at` DATETIME(0) NULL;
