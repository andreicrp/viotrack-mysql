ALTER TABLE `admins`
  ADD COLUMN `two_factor_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN `two_factor_secret` VARCHAR(512) NULL;

ALTER TABLE `teachers`
  ADD COLUMN `two_factor_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN `two_factor_secret` VARCHAR(512) NULL;
